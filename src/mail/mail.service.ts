import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: any, token: string) {
    const url = `example.com/auth/confirm?code=${token}`;

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
    const url = `example.com/auth/confirm?code=${token}`;

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
}
