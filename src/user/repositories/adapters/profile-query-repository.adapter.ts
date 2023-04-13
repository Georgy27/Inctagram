import { Injectable } from '@nestjs/common';
import { ProfileDbModel } from 'src/user/types';

@Injectable()
export abstract class ProfileQueryRepositoryAdapter {
  abstract findProfileAndAvatarByUserId(
    userId: string,
  ): Promise<ProfileDbModel | null>;
}
