import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VaultService } from './vault.service';
import { CreateVaultItemDto } from './dto/create-vault-item.dto';
import { UpdateVaultItemDto } from './dto/update-vault-item.dto';
import { DecryptRequestDto } from './dto/decrypt-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Vault')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vault')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo item no cofre (criptografado)' })
  create(@Request() req, @Body() createVaultItemDto: CreateVaultItemDto) {
    return this.vaultService.create(req.user.id, req.user.salt, createVaultItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os itens do cofre do usuário' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false })
  findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.vaultService.findAll(req.user.id, search, category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter metadados de um item do cofre' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.vaultService.findOne(req.user.id, id);
  }

  @Post(':id/decrypt')
  @ApiOperation({ summary: 'Descriptografar a senha/conteúdo atual de um item' })
  decrypt(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: DecryptRequestDto,
  ) {
    return this.vaultService.decryptItem(req.user.id, req.user.salt, id, dto.masterPassword);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar item do cofre (salva histórico se a senha for alterada)' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateVaultItemDto: UpdateVaultItemDto,
  ) {
    return this.vaultService.update(req.user.id, req.user.salt, id, updateVaultItemDto);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Listar histórico de revisões de senha de um item' })
  getHistory(@Request() req, @Param('id') id: string) {
    return this.vaultService.getHistory(req.user.id, id);
  }

  @Post(':id/history/:historyId/decrypt')
  @ApiOperation({ summary: 'Descriptografar uma versão antiga da senha do histórico' })
  decryptHistory(
    @Request() req,
    @Param('id') id: string,
    @Param('historyId') historyId: string,
    @Body() dto: DecryptRequestDto,
  ) {
    return this.vaultService.decryptHistoryItem(
      req.user.id,
      req.user.salt,
      id,
      historyId,
      dto.masterPassword,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar item e seu histórico de senhas' })
  remove(@Request() req, @Param('id') id: string) {
    return this.vaultService.remove(req.user.id, id);
  }
}
