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
import { Transform } from 'class-transformer';
import { format, parseISO } from 'date-fns';
import { BadRequestException } from '@nestjs/common';

export class CreateUserProfileDto {
  @Length(NAME_LENGTH_MIN, NAME_LENGTH_MAX)
  @IsString()
  @IsOptional()
  name?: string;

  @Length(SURNAME_LENGTH_MIN, SURNAME_LENGTH_MAX)
  @IsString()
  @IsOptional()
  surname?: string;
  @Transform(({ value }) => {
    try {
      return new Date(format(parseISO(value), 'yyyy-MM-dd'));
    } catch (error) {
      throw new BadRequestException(
        'Invalid time value. Birthday must be ISOString of format yyyy-MM-dd',
      );
    }
  })
  @IsDate({ message: 'birthday must be ISOString of format yyyy-MM-dd' })
  @IsOptional()
  birthday?: Date;

  @Length(CITY_LENGTH_MIN, CITY_LENGTH_MAX)
  @IsString()
  @IsOptional()
  city?: string;

  @Length(ABOUT_ME_LENGTH_MIN, ABOUT_ME_LENGTH_MAX)
  @IsString()
  @IsOptional()
  aboutMe?: string;
}
