import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthDto } from '../dto/auth.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MailService } from '../../mail/mail.service';
import { UserRepository } from '../../user/repositories/user.repository';

export class RegisterUserCommand {
  constructor(public authDto: AuthDto) {}
}
@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private mailService: MailService,
  ) {}
  async execute(command: RegisterUserCommand) {
    const { email, password } = command.authDto;
    // check that user with the given email does not exist
    const checkUserEmail = await this.userRepository.findUserByEmail(email);
    if (checkUserEmail)
      throw new BadRequestException('This email already exists');
    // generate salt and hash
    const passwordSalt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, passwordSalt);

    const newUser = await this.userRepository.createUser(command.authDto, hash);

    if (!newUser.emailConfirmation?.confirmationCode)
      throw new NotFoundException('confirmation code does not exist');
    // // send email
    try {
      return this.mailService.sendUserConfirmation(
        newUser,
        newUser.emailConfirmation.confirmationCode,
      );
    } catch (error) {
      console.log(error);
    }
  }
}
