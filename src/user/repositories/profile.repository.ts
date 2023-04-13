import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { PrismaClient, Profile } from '@prisma/client';
import { CreateUserProfileDto } from '../dto/create.user.profile.dto';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { ProfileRepositoryAdapter } from './adapters/profile-repository.adapter';

@Injectable()
export class ProfileRepository extends ProfileRepositoryAdapter<Profile> {
  public constructor(private readonly prisma: PrismaClient) {
    super();
  }

  public async createProfile(
    userId: string,
    createUserProfileDto: CreateUserProfileDto,
  ): Promise<Profile> {
    try {
      return this.prisma.profile.create({
        data: {
          userId,
          ...createUserProfileDto,
        },
      });
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException();
    }
  }

  public async updateProfile(
    userId: string,
    updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<void> {
    try {
      const { username, ...profileUpdateInfo } = updateUserProfileDto;
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          username,
          profile: {
            update: profileUpdateInfo,
          },
        },
      });
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException();
    }
  }
}
