import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthDto } from '../dto/auth.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MailService } from '../../mail/mail.service';
import { UserRepository } from '../../user/repositories/user.repository';
import { BcryptAdaptor } from '../../adaptors/bcrypt/bcrypt.adaptor';

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
    private bcryptAdaptor: BcryptAdaptor,
  ) {}
  async execute(command: RegisterUserCommand) {
    const { email, password, userName } = command.authDto;
    // check that user with the given email or userName does not exist
    const checkUserEmail = await this.userRepository.findUserByEmail(email);
    if (checkUserEmail)
      throw new BadRequestException('This email already exists');
    const checkUserByUserName = await this.userRepository.findUserByUserName(
      userName,
    );
    if (checkUserByUserName)
      throw new BadRequestException('This userName already exists');
    // generate salt and hash
    const hash = await this.bcryptAdaptor.generateSaltAndHash(password);

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
