import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmationCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
