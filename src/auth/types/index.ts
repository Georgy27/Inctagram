import type { OauthAccount } from '@prisma/client';

export interface LoginUserWithGithubCommandData {
  code: string;
}

export interface TokensPair {
  accessToken: string;
  refreshToken: string;
}

export type UpdateOrCreateOauthAccountPaylod = Pick<
  OauthAccount,
  'clientId' | 'type' | 'userId'
> &
  Partial<Pick<OauthAccount, 'mergeCode' | 'mergeCodeExpDate' | 'linked'>>;

export interface OauthCommandData {
  code: string;
  deviceId: string | null;
  ip: string;
  userAgent: string;
}
