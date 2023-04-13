import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Avatar } from '@prisma/client';
import { randomUUID } from 'crypto';
import { ImagesQueryRepositoryAdapter } from '../repositories/adapters/images-query-repository.adapter';
import { ImagesRepositoryAdapter } from '../repositories/adapters/images-repository.adapter';
import { CloudStrategy } from '../../common/strategies/cloud.strategy';
import { ImageService } from '../../common/services/image.service';
import { AvatarCreationError, FILE_UPLOAD_ERROR } from '../../common/errors';
import {
  AVATAR_PREVIEW_HEIGHT,
  AVATAR_PREVIEW_WIDTH,
} from '../../common/constants';

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
        width: AVATAR_PREVIEW_WIDTH,
        height: AVATAR_PREVIEW_HEIGHT,
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
