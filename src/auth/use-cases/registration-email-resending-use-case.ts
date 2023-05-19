import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailDto } from '../dto/email.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MailService } from '../../mail/mail.service';
import { UserRepository } from '../../user/repositories/user.repository';

export class RegistrationEmailResendingCommand {
  constructor(public emailDto: EmailDto) {}
}
@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase
  implements ICommandHandler<RegistrationEmailResendingCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
  ) {}

  async execute(command: RegistrationEmailResendingCommand) {
    const user = await this.userRepository.findUserByEmail(
      command.emailDto.email,
    );
    if (!user) throw new NotFoundException();
    // check if user is already confirmed
    if (user.emailConfirmation?.isConfirmed)
      throw new BadRequestException('user has already been confirmed');
    // update email confirmation info
    const emailConfirmationInfo =
      await this.userRepository.updateEmailConfirmationInfo(user.email);

    try {
      await this.mailService.sendUserConfirmation(
        user,
        emailConfirmationInfo.confirmationCode,
      );
    } catch (error) {
      console.log(error);
    }
  }
}
