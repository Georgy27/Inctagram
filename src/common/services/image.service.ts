import { Injectable } from '@nestjs/common';

import { ImageMetadataType } from '../types';

export interface Dimensions {
  width?: number;
  height?: number;
}

@Injectable()
export abstract class ImageService {
  public abstract getMetadata(buffer: Buffer): Promise<ImageMetadataType>;

  public abstract resize(
    file: Express.Multer.File,
    dimensions: Dimensions,
  ): Promise<Express.Multer.File>;
}
