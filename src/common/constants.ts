export const API = {
  USERS: 'api/users',
  AUTH: 'api/auth',
};

// Field of incoming HTTP message with file data
export const FILE_FIELD = 'file';
export const FILES_FIELD = 'files';
export const MAX_IMAGES_COUNT = 10;

export const MAX_AVATAR_SIZE = 1024 * 1024 * 2;
export const MIN_AVATAR_HEIGHT = 400;
export const MIN_AVATAR_WIDTH = 400;
export const MAX_AVATAR_HEIGHT = 800;
export const MAX_AVATAR_WIDTH = 800;
export const PREVIEW_WIDTH = 257;
export const PREVIEW_HEIGHT = 257;
export const POST_PREVIEW_WIDTH = 450;
export const POST_PREVIEW_HEIGHT = 450;
export const MAX_POST_PHOTO_SIZE = 1024 * 1024 * 5;

// Cloud
export const REGION = 'us-east-2';
export const YANDEX_CLOUD_ENDPOINT = 'https://storage.yandexcloud.net';
export const YANDEX_CLOUD_STORAGE_HOSTNAME = 'storage.yandexcloud.net';

export const NAME_LENGTH_MIN = 1;
export const NAME_LENGTH_MAX = 40;

export const USERNAME_LENGTH_MIN = 6;
export const USERNAME_LENGTH_MAX = 30;
export const SURNAME_LENGTH_MIN = 1;
export const SURNAME_LENGTH_MAX = 40;

export const CITY_LENGTH_MIN = 1;
export const CITY_LENGTH_MAX = 60;

export const ABOUT_ME_LENGTH_MIN = 1;
export const ABOUT_ME_LENGTH_MAX = 200;

export const PRODUCTION_MODE = 'production';

export const RECAPTCHA_TOKEN = 'recaptchaToken';

export const enum OauthProvider {
  GITHUB = 'GITHUB',
  GOOGLE = 'GOOGLE',
}
