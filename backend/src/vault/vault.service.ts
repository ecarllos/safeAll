import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../crypto/crypto.service';
import { CreateVaultItemDto } from './dto/create-vault-item.dto';
import { UpdateVaultItemDto } from './dto/update-vault-item.dto';

@Injectable()
export class VaultService {
  constructor(
    private prisma: PrismaService,
    private cryptoService: CryptoService,
  ) {}

  async create(userId: string, userSalt: string, dto: CreateVaultItemDto) {
    const encrypted = this.cryptoService.encrypt(
      dto.passwordOrSecret,
      dto.masterPassword,
      userSalt,
    );

    return this.prisma.vaultItem.create({
      data: {
        userId,
        title: dto.title,
        category: dto.category,
        username: dto.username || null,
        url: dto.url || null,
        notes: dto.notes || null,
        encryptedData: encrypted.encryptedData,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
      },
    });
  }

  async findAll(userId: string, search?: string, category?: string) {
    const where: any = { userId };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const items = await this.prisma.vaultItem.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { history: true },
        },
      },
    });

    return items.map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      username: item.username,
      url: item.url,
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      historyCount: item._count.history,
    }));
  }

  async findOne(userId: string, id: string) {
    const item = await this.prisma.vaultItem.findFirst({
      where: { id, userId },
      include: {
        history: {
          orderBy: { changedAt: 'desc' },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Item do cofre não encontrado.');
    }

    return item;
  }

  async update(userId: string, userSalt: string, id: string, dto: UpdateVaultItemDto) {
    const item = await this.findOne(userId, id);

    const updateData: any = {};

    if (dto.title) updateData.title = dto.title;
    if (dto.category) updateData.category = dto.category;
    if (dto.username !== undefined) updateData.username = dto.username;
    if (dto.url !== undefined) updateData.url = dto.url;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    // Se uma nova senha/segredo foi fornecida, salvar a atual no histórico e criptografar a nova
    if (dto.passwordOrSecret) {
      if (!dto.masterPassword) {
        throw new BadRequestException('Senha mestra é necessária para atualizar o segredo.');
      }

      // Guardar a versão anterior no histórico antes de sobrescrever
      await this.prisma.vaultItemHistory.create({
        data: {
          vaultItemId: item.id,
          encryptedData: item.encryptedData,
          iv: item.iv,
          authTag: item.authTag,
        },
      });

      const encrypted = this.cryptoService.encrypt(
        dto.passwordOrSecret,
        dto.masterPassword,
        userSalt,
      );

      updateData.encryptedData = encrypted.encryptedData;
      updateData.iv = encrypted.iv;
      updateData.authTag = encrypted.authTag;
    }

    return this.prisma.vaultItem.update({
      where: { id: item.id },
      data: updateData,
    });
  }

  async decryptItem(userId: string, userSalt: string, id: string, masterPassword: string) {
    const item = await this.findOne(userId, id);

    const decrypted = this.cryptoService.decrypt(
      item.encryptedData,
      item.iv,
      item.authTag,
      masterPassword,
      userSalt,
    );

    return {
      id: item.id,
      passwordOrSecret: decrypted,
    };
  }

  async getHistory(userId: string, id: string) {
    const item = await this.findOne(userId, id);
    return item.history.map((h) => ({
      id: h.id,
      changedAt: h.changedAt,
    }));
  }

  async decryptHistoryItem(
    userId: string,
    userSalt: string,
    id: string,
    historyId: string,
    masterPassword: string,
  ) {
    await this.findOne(userId, id); // Valida posse

    const historyRecord = await this.prisma.vaultItemHistory.findFirst({
      where: { id: historyId, vaultItemId: id },
    });

    if (!historyRecord) {
      throw new NotFoundException('Registro de histórico não encontrado.');
    }

    const decrypted = this.cryptoService.decrypt(
      historyRecord.encryptedData,
      historyRecord.iv,
      historyRecord.authTag,
      masterPassword,
      userSalt,
    );

    return {
      historyId: historyRecord.id,
      changedAt: historyRecord.changedAt,
      passwordOrSecret: decrypted,
    };
  }

  async remove(userId: string, id: string) {
    const item = await this.findOne(userId, id);
    return this.prisma.vaultItem.delete({
      where: { id: item.id },
    });
  }
}
