import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import {
  ABOUT_ME_LENGTH_MAX,
  ABOUT_ME_LENGTH_MIN,
  CITY_LENGTH_MAX,
  CITY_LENGTH_MIN,
  NAME_LENGTH_MAX,
  NAME_LENGTH_MIN,
  SURNAME_LENGTH_MAX,
  SURNAME_LENGTH_MIN,
} from 'src/common/constants';

export class CreateUserProfileDto {
  @Length(NAME_LENGTH_MIN, NAME_LENGTH_MAX)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Length(SURNAME_LENGTH_MIN, SURNAME_LENGTH_MAX)
  @IsString()
  @IsNotEmpty()
  surname: string;

  @IsDate()
  @IsOptional()
  birthday: Date | null;

  @Length(CITY_LENGTH_MIN, CITY_LENGTH_MAX)
  @IsString()
  @IsNotEmpty()
  city: string;

  @Length(ABOUT_ME_LENGTH_MIN, ABOUT_ME_LENGTH_MAX)
  @IsString()
  @IsOptional()
  aboutMe: string | null;
}
