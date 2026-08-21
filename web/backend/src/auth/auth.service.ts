import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../crypto/crypto.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private cryptoService: CryptoService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Já existe um usuário cadastrado com este email.');
    }

    const salt = this.cryptoService.generateSalt();
    const masterPasswordHash = await this.cryptoService.hashMasterPassword(dto.masterPassword);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        masterPasswordHash,
        salt,
      },
    });

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      message: 'Usuário registrado com sucesso!',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        salt: user.salt,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou senha mestra incorretos.');
    }

    const isPasswordValid = await this.cryptoService.verifyMasterPassword(
      dto.masterPassword,
      user.masterPasswordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha mestra incorretos.');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      message: 'Login efetuado com sucesso!',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        salt: user.salt,
      },
    };
  }
}
