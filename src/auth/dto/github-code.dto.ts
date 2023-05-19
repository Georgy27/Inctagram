import { IsNotEmpty, IsString } from 'class-validator';

export class GithubCodeDto {
  @IsString()
  @IsNotEmpty()
  public code: string;
}
