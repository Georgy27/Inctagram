import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../user/repositories/user.repository';

export class LogoutUserCommand {
  constructor(public userId: string) {}
}
@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(private readonly userRepository: UserRepository) {}
  async execute(command: LogoutUserCommand) {
    return this.userRepository.logout(command.userId);
  }
}
