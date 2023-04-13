import {
  HttpStatus,
  BadRequestException,
  ParseFilePipeBuilder,
} from '@nestjs/common';

import { MAX_AVATAR_SIZE } from '../constants';
import { ImageDimensionsValidatonPipe } from './image-dimensions-validation.pipe';

export const ImageValidationPipe = <
  T extends {
    fileType: string;
    maxSize?: number;
    minHeight: number;
    minWidth: number;
  },
>(
  args: T,
) => {
  const { fileType, maxSize = MAX_AVATAR_SIZE, minHeight, minWidth } = args;

  return new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType,
    })
    .addMaxSizeValidator({
      maxSize,
    })
    .addValidator(
      new ImageDimensionsValidatonPipe({
        minWidth,
        minHeight,
      }),
    )
    .build({
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
      exceptionFactory: (err) => {
        throw new BadRequestException(err);
      },
    });
};
