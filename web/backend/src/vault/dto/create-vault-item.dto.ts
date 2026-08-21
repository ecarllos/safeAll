import { IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

export class CreateVaultItemDto {
  @IsString()
  @IsNotEmpty({ message: 'O título é obrigatório.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'A categoria é obrigatória.' })
  @IsIn(['bank', 'dev', 'app', 'note'], { message: 'Categoria inválida. Opções: bank, dev, app, note.' })
  category: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha ou conteúdo a ser criptografado é obrigatório.' })
  passwordOrSecret: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha mestra é necessária para criptografar o item.' })
  masterPassword: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
