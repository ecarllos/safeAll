import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateVaultItemDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  @IsIn(['bank', 'dev', 'app', 'note'])
  category?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  passwordOrSecret?: string; // Se fornecido, a versão anterior é salva no histórico

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  masterPassword?: string; // Necessário caso passwordOrSecret seja atualizado
}
