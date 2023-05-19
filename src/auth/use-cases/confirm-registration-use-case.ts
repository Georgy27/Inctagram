import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, GoneException } from '@nestjs/common';
import { UserRepository } from '../../user/repositories/user.repository';
import { ConfirmationCodeDto } from '../dto/confirmation-code.dto';
import { UserWithEmailConfirmation } from '../../user/types';

export class ConfirmRegistrationCommand {
  constructor(public codeDto: ConfirmationCodeDto) {}
}
@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseCase
  implements ICommandHandler<ConfirmRegistrationCommand>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: ConfirmRegistrationCommand) {
    // check user
    const user = await this.userRepository.findUserByEmailConfirmationCode(
      command.codeDto.code,
    );

    if (!user)
      throw new BadRequestException(
        'No user exists with the given confirmation code',
      );

    const checkCode = this.checkUserConfirmationCode(
      user,
      command.codeDto.code,
    );

    await this.userRepository.updateEmailConfirmationCode(user.email);
  }
  checkUserConfirmationCode(user: UserWithEmailConfirmation, code: string) {
    if (!user.emailConfirmation)
      throw new BadRequestException(
        'No email confirmation exists for the current user',
      );
    if (user.emailConfirmation.isConfirmed) {
      throw new BadRequestException('User email already confirmed');
    }
    if (user.emailConfirmation.confirmationCode !== code) {
      throw new BadRequestException('User code does not match');
    }
    if (user.emailConfirmation.expirationDate < new Date().toISOString()) {
      throw new GoneException('User code has expired');
    }
    return true;
  }
}
