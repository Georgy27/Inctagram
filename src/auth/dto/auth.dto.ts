import { IsEmail, IsString, Length } from 'class-validator';

export class AuthDto {
  @IsEmail()
  email: string;
  @Length(6, 20)
  @IsString()
  password: string;
}
