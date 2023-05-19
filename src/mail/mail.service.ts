import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class MailService {
  public constructor(private readonly mailerService: MailerService) {}

  async sendUserConfirmation(user: Partial<User>, token: string) {
    const url = `https://inctagram-m9ju.vercel.app/registration/confirmation?code=${token}&email=${user.email}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to INCTAGRAM! Confirm your Email',
      template: 'confirmation',
      context: {
        name: 'stranger',
        url,
      },
    });
  }

  async sendPasswordRecovery(user: User, token: string) {
    const url = `https://inctagram-m9ju.vercel.app/recovery/new-password?code=${token}&email=${user.email}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to INCTAGRAM! Recover your password',
      template: 'recovery',
      context: {
        name: 'stranger',
        url,
      },
    });
  }

  public async sendAccountsMerge(
    user: Pick<User, 'email' | 'username'>,
    token: string,
  ) {
    const { email, username } = user;
    const mergeUrl = `https://inctagram.herokuapp.com/api/auth/merge-account?code=${token}`;
    const loginUrl = `https://inctagram-m9ju.vercel.app/login`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to INCTAGRAM! Want to merge your accounts?',
      template: 'merge',
      context: {
        name: username,
        loginUrl,
        mergeUrl,
      },
    });
  }
}
