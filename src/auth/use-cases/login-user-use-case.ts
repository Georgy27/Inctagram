import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtAdaptor } from '../../adaptors/jwt/jwt.adaptor';
import { UserRepository } from '../../user/repositories/user.repository';
import { LoginDto } from '../dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
export class LoginUserCommand {
  constructor(public loginDto: LoginDto) {}
}
@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,

    private readonly jwtAdaptor: JwtAdaptor,
  ) {}
  async execute(command: LoginUserCommand) {
    // find user and check if its banned
    const user = await this.userRepository.findUserByEmail(
      command.loginDto.email,
    );
    if (!user)
      throw new UnauthorizedException(
        'User with the given email does not exist',
      );
    const checkPassword = await bcrypt.compare(
      command.loginDto.password,
      user.hash,
    );
    if (!checkPassword) throw new UnauthorizedException();
    // tokens
    const tokens = await this.jwtAdaptor.getTokens(user.id);
    const hashedTokens = await this.jwtAdaptor.updateTokensHash(tokens);
    await this.userRepository.updateUserTokens(user.id, hashedTokens);

    return tokens;
  }
}
