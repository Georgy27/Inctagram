import { Injectable, PipeTransform } from '@nestjs/common';
import sharp from 'sharp';

import { MAX_AVATAR_HEIGHT, MAX_AVATAR_WIDTH } from '../constants';

@Injectable()
export class MinimizeImagePipe implements PipeTransform {
  async transform(file: Express.Multer.File): Promise<Express.Multer.File> {
    const { height = 0, width = 0 } = await sharp(file.buffer).metadata();

    if (height > MAX_AVATAR_HEIGHT || width > MAX_AVATAR_WIDTH) {
      const resizedBuffer = await sharp(file.buffer)
        .resize({
          width: width > MAX_AVATAR_WIDTH ? MAX_AVATAR_WIDTH : width,
          height: height > MAX_AVATAR_HEIGHT ? MAX_AVATAR_HEIGHT : height,
          fit: 'inside',
        })
        .toBuffer();

      return { ...file, buffer: resizedBuffer };
    }

    return file;
  }
}
