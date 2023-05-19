import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';

import { UserRepository } from 'src/user/repositories/user.repository';
import { MailService } from 'src/mail/mail.service';
import { BadRequestException, GoneException } from '@nestjs/common';

export class NewPasswordCommand {
  public constructor(
    public readonly newPassword: string,
    public readonly recoveryCode: string,
  ) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
  public constructor(private readonly usersRepository: UserRepository) {}

  public async execute(command: NewPasswordCommand) {
    const { newPassword, recoveryCode } = command;

    try {
      const user =
        await this.usersRepository.findUserByConfirmationOrRecoveryCode(
          recoveryCode,
        );

      if (!user) throw new BadRequestException();

      const exp = user?.passwordRecovery?.expirationDate;

      if (exp) {
        if (new Date(exp) > new Date()) {
          const hash = await bcrypt.hash(newPassword, 10);

          await this.usersRepository.updatePassword(user.id, hash);
        } else {
          throw new GoneException();
        }
      }
    } catch (error) {
      console.log(error);

      if (error instanceof BadRequestException) throw error;
    }
  }
}
