import { registerAs } from '@nestjs/config';

export const githubOauthConfig = registerAs('github', () => ({
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  tokenUrl: process.env.GITHUB_TOKEN_URL,
  userUrl: process.env.GITHUB_USER_URL,
  userEmailsUrl: process.env.GITHUB_USER_EMAILS_URL,
}));
