import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRepository } from 'src/user/repositories/user.repository';

@Injectable()
export class UserEmailConfirmationGuard implements CanActivate {
  constructor(private readonly usersRepository: UserRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.userId;
    const user = await this.usersRepository.findUserById(userId);

    if (!user || !user.emailConfirmation?.isConfirmed) {
      throw new ForbiddenException();
    }

    return true;
  }
}
