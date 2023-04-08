import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class AuthDto {
  @Length(6, 30)
  @IsString()
  @IsNotEmpty()
  userName: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @Length(6, 20)
  @IsString()
  @IsNotEmpty()
  password: string;
}
