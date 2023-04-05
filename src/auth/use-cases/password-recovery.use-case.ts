import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceUnavailableException } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { UserRepository } from 'src/user/repositories/user.repository';
import { MailService } from 'src/mail/mail.service';

export class PasswordRecoveryCommand {
  public constructor(public readonly email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUserUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  public constructor(
    private readonly usersRepository: UserRepository,
    private readonly mailService: MailService,
  ) {}

  public async execute(command: PasswordRecoveryCommand) {
    const { email } = command;

    const user = await this.usersRepository.findUserByEmail(email);

    if (!user) return;

    const recoveryCode = randomUUID();

    try {
      await Promise.all([
        this.mailService.sendPasswordRecovery(user, recoveryCode),
        this.usersRepository.updatePasswordRecoveryCode(user.id, recoveryCode),
      ]);
    } catch (error) {
      console.log(error);

      throw new ServiceUnavailableException(
        'Could not proceed recovery password',
      );
    }
  }
}
