import { Injectable } from '@nestjs/common';
import { CreateUserProfileDto } from '../../dto/create.user.profile.dto';

@Injectable()
export abstract class ProfileRepositoryAdapter<T> {
  abstract createProfile(
    userId: string,
    createUserProfileDto: CreateUserProfileDto,
  ): Promise<T>;

  abstract updateProfile(
    userId: string,
    updateUserProfileDto: Partial<CreateUserProfileDto>,
  ): Promise<void>;
}
