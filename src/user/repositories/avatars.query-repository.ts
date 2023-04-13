import { Injectable } from '@nestjs/common';
import { Avatar } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { ImagesQueryRepositoryAdapter } from './adapters/images-query-repository.adapter';

@Injectable()
export class AvatarsQueryRepository extends ImagesQueryRepositoryAdapter<Avatar> {
  public constructor(private readonly prismaService: PrismaService) {
    super();
  }

  public async findByUserId(id: string): Promise<Avatar | null> {
    try {
      return this.prismaService.avatar.findFirst({
        where: {
          userId: id,
        },
      });
    } catch (error) {
      console.log(error);

      return null;
    }
  }
}
