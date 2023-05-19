import { PrismaClient } from '@prisma/client';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { UsersController } from './api/users.controller';
import { UserRepository } from './repositories/user.repository';
import { ImageService } from 'src/common/services/image.service';
import { SharpService } from 'src/common/services/sharp.service';
import { CloudStrategy } from 'src/common/strategies/cloud.strategy';
import { AvatarsRepository } from './repositories/avatars.repository';
import { UploadAvatarUseCase } from './use-cases/upload-avatar.use-case';
import { AvatarsQueryRepository } from './repositories/avatars.query-repository';
import { YandexCloudStrategy } from 'src/common/strategies/yandex-cloud.strategy';
import { ImagesRepositoryAdapter } from './repositories/adapters/images-repository.adapter';
import { ImagesQueryRepositoryAdapter } from './repositories/adapters/images-query-repository.adapter';
import { ProfileQueryRepository } from './repositories/profile.query-repository';
import { CreateProfileUseCase } from './use-cases/create-profile.use-case';
import { ProfileRepository } from './repositories/profile.repository';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';
import { ProfileRepositoryAdapter } from './repositories/adapters/profile-repository.adapter';
import { ProfileQueryRepositoryAdapter } from './repositories/adapters/profile-query-repository.adapter';
import { CreatePostUseCase } from './use-cases/post/create-post.use-case';
import { DeletePostUseCase } from './use-cases/post/delete-post.use-case';
import { PostsRepositoryAdapter } from './repositories/adapters/post/posts.adapter';
import { PostsRepository } from './repositories/post/posts.repository';
import { UpdatePostUseCase } from './use-cases/post/update-post.use-case';
import { PostsQueryRepositoryAdatapter } from './repositories/adapters/post/posts.query-adapter';
import { PostsQueryRepository } from './repositories/post/posts.query-repository';

const useCases = [
  UploadAvatarUseCase,
  CreateProfileUseCase,
  UpdateProfileUseCase,
  CreatePostUseCase,
  DeletePostUseCase,
  UpdatePostUseCase,
];

@Module({
  imports: [CqrsModule],
  controllers: [UsersController],
  providers: [
    UserRepository,
    PrismaClient,
    ...useCases,
    {
      provide: CloudStrategy,
      useClass: YandexCloudStrategy,
    },
    {
      provide: ImagesQueryRepositoryAdapter,
      useClass: AvatarsQueryRepository,
    },
    {
      provide: ImagesRepositoryAdapter,
      useClass: AvatarsRepository,
    },
    {
      provide: ImageService,
      useClass: SharpService,
    },
    {
      provide: ProfileRepositoryAdapter,
      useClass: ProfileRepository,
    },
    {
      provide: ProfileQueryRepositoryAdapter,
      useClass: ProfileQueryRepository,
    },
    {
      provide: PostsRepositoryAdapter,
      useClass: PostsRepository,
    },
    {
      provide: PostsQueryRepositoryAdatapter,
      useClass: PostsQueryRepository,
    },
  ],
  exports: [UserRepository],
})
export class UserModule {}
