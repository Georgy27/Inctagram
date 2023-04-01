import { IsEmail, IsString, Length } from 'class-validator';

export class AuthDto {
  @Length(6, 20)
  @IsString()
  password: string;
  @IsEmail()
  email: string;
}
