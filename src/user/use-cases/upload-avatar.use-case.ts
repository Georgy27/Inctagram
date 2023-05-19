import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Avatar } from '@prisma/client';
import { randomUUID } from 'crypto';

import { PREVIEW_HEIGHT, PREVIEW_WIDTH } from 'src/common/constants';
import { ImageService } from 'src/common/services/image.service';
import { CloudStrategy } from 'src/common/strategies/cloud.strategy';
import { AvatarCreationError, FILE_UPLOAD_ERROR } from 'src/common/errors';
import { ImagesQueryRepositoryAdapter } from '../repositories/adapters/images-query-repository.adapter';
import { ImagesRepositoryAdapter } from '../repositories/adapters/images-repository.adapter';

export class UploadAvatarCommand {
  public constructor(public userId: string, public file: Express.Multer.File) {}
}

@CommandHandler(UploadAvatarCommand)
export class UploadAvatarUseCase implements ICommandHandler {
  public constructor(
    private readonly avatarsQueryRepository: ImagesQueryRepositoryAdapter<Avatar>,
    private readonly avatarsRepository: ImagesRepositoryAdapter<Avatar>,
    private readonly cloudService: CloudStrategy,
    private readonly imageService: ImageService,
  ) {}

  public async execute(command: UploadAvatarCommand): Promise<Avatar | null> {
    const { userId, file } = command;

    const existingAvatar = await this.avatarsQueryRepository.findByUserId(
      userId,
    );

    const { url: existingUrl, previewUrl: existingPreviewUrl } =
      existingAvatar ?? {};

    try {
      const { size, width, height } = await this.imageService.getMetadata(
        file.buffer,
      );

      const ext = file.originalname.split('.')[1];
      const avatarName = `${randomUUID()}.${ext}`;
      const avatarPath = `${this.createPrefix(userId)}${avatarName}`;

      const preview = await this.imageService.resize(file, {
        width: PREVIEW_WIDTH,
        height: PREVIEW_HEIGHT,
      });

      const previewName = `${randomUUID()}.${ext}`;
      const previewPath = `${this.createPrefix(userId)}.preivew.${previewName}`;

      const [url, previewUrl] = await Promise.all([
        this.cloudService.upload(avatarPath, file),
        this.cloudService.upload(previewPath, preview),
      ]);

      const avatarPayload = {
        url,
        previewUrl,
        size,
        height,
        width,
      };

      const avatar = await this.avatarsRepository.create(userId, avatarPayload);

      if (existingUrl && existingPreviewUrl) {
        await this.cloudService.remove([existingUrl, existingPreviewUrl]);
      }

      return avatar;
    } catch (error) {
      console.log(error);

      throw new AvatarCreationError(FILE_UPLOAD_ERROR);
    }
  }

  private createPrefix(userId: string) {
    return `content/users/${userId}/avatar/`;
  }
}
