import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleCodeDto {
  @IsString()
  @IsNotEmpty()
  public code: string;
}
