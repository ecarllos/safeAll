import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Informe um email válido.' })
  @IsNotEmpty({ message: 'O email é obrigatório.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha mestra é obrigatória.' })
  @MinLength(8, { message: 'A senha mestra deve ter no mínimo 8 caracteres.' })
  masterPassword: string;
}
