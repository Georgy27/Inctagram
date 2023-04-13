import type { Avatar, Profile, User } from '@prisma/client';

export interface UserWithEmailConfirmation extends User {
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: string;
    isConfirmed: boolean;
  } | null;
}

export interface UserWithPasswordRecovery extends User {
  passwordRecovery: {
    recoveryCode: string | null;
    expirationDate: string | null;
  } | null;
}

export interface ActiveUserData {
  userId: string;
  username: string;
  deviceId: string;
}

export type AvatarPayload = Pick<
  Avatar,
  'height' | 'width' | 'url' | 'previewUrl' | 'size'
>;

export type ProfileDbModel = {
  profile: Pick<
    Profile,
    'aboutMe' | 'birthday' | 'city' | 'name' | 'surname'
  > | null;
  username: string;
  avatar: Pick<Avatar, 'url' | 'previewUrl'> | null;
};

export type ProfileViewModel = Omit<
  Profile,
  'updatedAt' | 'id' | 'createdAt' | 'userId'
> & { avatar: Pick<Avatar, 'url' | 'previewUrl'> } & Pick<User, 'username'>;
