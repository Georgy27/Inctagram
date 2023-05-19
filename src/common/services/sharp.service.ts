import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { ImageMetadataType } from '../types';

import { Dimensions, ImageService } from './image.service';

@Injectable()
export class SharpService extends ImageService {
  public async getMetadata(buffer: Buffer): Promise<ImageMetadataType> {
    const metadata = await sharp(buffer).metadata();

    return { height: null, width: null, size: null, ...metadata };
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
        fit: 'cover',
      })
      .toBuffer();

    return { ...file, buffer: resizedBuffer };
  }
}
