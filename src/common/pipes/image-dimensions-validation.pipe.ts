import { FileValidator, Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { BAD_DIMENSIONS } from '../errors';

type ValidationOptions = {
  minWidth: number;
  minHeight: number;
};

@Injectable()
export class ImageDimensionsValidatonPipe extends FileValidator<ValidationOptions> {
  public constructor(options: ValidationOptions) {
    super(options);
  }

  async isValid(file?: Express.Multer.File): Promise<boolean> {
    if (!file) return false;

    const { height = 0, width = 0 } = await sharp(file.buffer).metadata();

    return !(
      height < this.validationOptions.minHeight ||
      width < this.validationOptions.minWidth
    );
  }

  buildErrorMessage(): string {
    return BAD_DIMENSIONS;
  }
}
