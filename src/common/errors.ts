import { InternalServerErrorException } from '@nestjs/common';

// Image Entity
export const BAD_DIMENSIONS = 'Image is too small';

export const FILE_DELITION_ERROR = 'Delition has failed';

export const FILE_UPLOAD_ERROR = 'Image uploading has failed';

export class AvatarCreationError extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
  }
}
