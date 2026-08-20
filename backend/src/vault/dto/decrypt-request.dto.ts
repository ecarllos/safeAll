import { IsNotEmpty, IsString } from 'class-validator';

export class DecryptRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'A senha mestra é obrigatória para descriptografar.' })
  masterPassword: string;
}
