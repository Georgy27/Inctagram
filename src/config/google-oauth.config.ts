import { registerAs } from '@nestjs/config';

export const googleOauthConfig = registerAs('google', () => ({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  tokenUrl: process.env.GOOGLE_TOKEN_URL,
}));
