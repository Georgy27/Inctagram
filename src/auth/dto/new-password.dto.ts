import { IsNotEmpty, IsString, Length } from 'class-validator';

export class NewPasswordDto {
  @Length(6, 20)
  @IsString()
  newPassword: string;
  @IsNotEmpty()
  @IsString()
  recoveryCode: string;
}
