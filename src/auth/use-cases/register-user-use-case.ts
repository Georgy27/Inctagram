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
    // const { email, password } = command.authDto;
    //
    // // check that user with the given login or email does not exist
    // const checkUserLogin = await this.usersSQLRepository.findUserByLogin(login);
    // if (checkUserLogin)
    //   throw new BadRequestException([
    //     { message: 'This login already exists', field: 'login' },
    //   ]);
    // const checkUserEmail = await this.usersSQLRepository.findUserByEmail(email);
    // if (checkUserEmail)
    //   throw new BadRequestException([
    //     { message: 'This email already exists', field: 'email' },
    //   ]);
    // //   // create user
    // // generate salt and hash
    // const passwordSalt = await bcrypt.genSalt(10);
    // const hash = await bcrypt.hash(password, passwordSalt);
    //
    // const newUser = await this.usersSQLRepository.createUser(
    //   command.authDto,
    //   hash,
    // );
    // const emailConfirmation =
    //   await this.usersSQLRepository.getEmailConfirmationCode(newUser.email);
    // if (!emailConfirmation)
    //   throw new NotFoundException('confirmation code does not exist');
    // // send email
    // try {
    //   return this.mailService.sendUserConfirmation(
    //     newUser,
    //     emailConfirmation.confirmationCode,
    //   );
    // } catch (error) {
    //   console.log(error);
    // }
  }
}
