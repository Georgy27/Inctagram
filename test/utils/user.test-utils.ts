import { PrismaClient } from '@prisma/client';
import { RegisterUserCommand } from 'src/auth/use-cases/register-user-use-case';

export class UserTestUtils {
  public constructor(private readonly prismaClient: PrismaClient) {}

  public async createConfirmedUser(
    command: RegisterUserCommand,
  ): Promise<{ id: string }> {
    return this.prismaClient.user.create({
      data: {
        username: command.authDto.username,
        email: command.authDto.email,
        hash: command.authDto.password,
        emailConfirmation: {
          create: {
            confirmationCode: '',
            expirationDate: '',
            isConfirmed: true,
          },
        },
        passwordRecovery: { create: {} },
      },
      select: {
        id: true,
      },
    });
  }
}
