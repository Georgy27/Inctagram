import { Injectable } from '@nestjs/common';
import { Avatar, Prisma, PrismaClient } from '@prisma/client';

import { AvatarPayload } from '../types';
import { ImagesRepositoryAdapter } from './adapters/images-repository.adapter';

@Injectable()
export class AvatarsRepository extends ImagesRepositoryAdapter<Avatar> {
  public constructor(private readonly prismaClient: PrismaClient) {
    super();
  }

  public async create(
    userId: string,
    payload: AvatarPayload,
  ): Promise<Avatar | null> {
    const { height, width, size, url, previewUrl } = payload;

    try {
      return this.prismaClient.avatar.upsert({
        where: {
          userId,
        },
        update: {
          height,
          width,
          size,
          url,
          previewUrl,
        },
        create: {
          height,
          width,
          size,
          url,
          previewUrl,
          userId,
        },
      });
    } catch (error) {
      console.log(error);

      return null;
    }
  }

  public async deleteAll(): Promise<Prisma.BatchPayload | null> {
    try {
      return this.prismaClient.avatar.deleteMany();
    } catch (error) {
      console.log(error);

      return null;
    }
  }
}
