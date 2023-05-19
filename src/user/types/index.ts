import type {
  Avatar,
  Image,
  ImageMetadata,
  OauthAccount,
  Post,
  Profile,
  User,
} from '@prisma/client';
import { CreateUserDto } from '../dto/create.user.dto';

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

export interface Oauth20UserData {
  oauthClientId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
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
  'updatedAt' | 'id' | 'createdAt' | 'userId' | 'birthday'
> & { birthday: string | null } & {
  avatar: Pick<Avatar, 'url' | 'previewUrl'>;
} & Pick<User, 'username'>;

export type CreatePostResult = Post & {
  images: (Image & {
    metadata: ImageMetadata | null;
  })[];
};

export type ImageCreationData = Pick<Image, 'previewUrl' | 'url'> & {
  metadata: Pick<ImageMetadata, 'height' | 'size' | 'width'>;
};

export interface CreateUserWithOauthAccountData
  extends Pick<CreateUserDto, 'email' | 'username'>,
    Partial<Pick<Profile, 'name' | 'surname'>>,
    Partial<{
      avatarPayload: Pick<
        Avatar,
        'size' | 'height' | 'width' | 'url' | 'previewUrl'
      >;
    }>,
    Pick<OauthAccount, 'clientId' | 'type'> {}

export type UserPosts = Pick<Post, 'id' | 'createdAt'> & {
  images: Pick<Image, 'previewUrl'>[];
};

export type UserPost = Pick<
  Post,
  'id' | 'description' | 'createdAt' | 'updatedAt'
> & {
  images: (
    | Pick<Image, 'url' | 'previewUrl'> & {
        metadata: Pick<ImageMetadata, 'width' | 'height'> | null;
      }
  )[];
};
