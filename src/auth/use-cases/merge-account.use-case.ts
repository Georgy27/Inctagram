import { UserRepository } from 'src/user/repositories/user.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ForbiddenException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

export class MergeAccountCommand {
  constructor(public readonly mergeCode: string) {}
}
@CommandHandler(MergeAccountCommand)
export class RegisterUserUseCase
  implements ICommandHandler<MergeAccountCommand>
{
  constructor(private readonly userRepository: UserRepository) {}
  async execute(command: MergeAccountCommand) {
    try {
      const { mergeCode } = command;

      const oauthAccount = await this.userRepository.findOauthAccountByQuery({
        mergeCode,
      });

      if (!oauthAccount) throw new ForbiddenException();

      if (oauthAccount.mergeCode !== mergeCode)
        throw new UnauthorizedException();

      const { clientId, userId, type } = oauthAccount;

      await this.userRepository.updateOrCreateOauthAccount({
        clientId,
        userId,
        type,
        linked: true,
      });
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException();
    }
  }
}
