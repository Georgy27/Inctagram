import { Injectable } from '@nestjs/common';
import sharp, { Metadata } from 'sharp';

import { Dimensions, ImageService } from './image.service';

@Injectable()
export class SharpService extends ImageService {
  public async getMetadata(buffer: Buffer): Promise<Partial<Metadata>> {
    return sharp(buffer).metadata();
  }

  public async resize(
    file: Express.Multer.File,
    dimensions: Dimensions,
  ): Promise<Express.Multer.File> {
    const { width, height } = dimensions;

    const resizedBuffer = await sharp(file.buffer)
      .resize({
        width,
        height,
        fit: 'inside',
      })
      .toBuffer();

    return { ...file, buffer: resizedBuffer };
  }
}
