import { Allow, IsNotEmpty, IsString } from 'class-validator';

export class GithubCallbackQueryDto {
  @IsString()
  @IsNotEmpty()
  code: number;

  @Allow()
  state: string;
}
