import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailConfirmation, Token, User } from '@prisma/client';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { CreateUserDto } from '../dto/create.user.dto';
import { UserWithEmailConfirmation } from '../types';
@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto, hash: string) {
    return this.prisma.user.upsert({
      create: {
        email: createUserDto.email,
        hash: hash,
        emailConfirmation: {
          create: {
            confirmationCode: randomUUID(),
            expirationDate: add(new Date(), {
              minutes: 1,
            }).toISOString(),
            isConfirmed: false,
          },
        },
        passwordRecovery: { create: {} },
      },
      update: {
        email: createUserDto.email,
        hash: hash,
      },
      where: { email: createUserDto.email },
      select: {
        id: true,
        email: true,
        createdAt: true,
        emailConfirmation: {
          select: {
            confirmationCode: true,
          },
        },
      },
    });
  }
  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email },
      include: {
        emailConfirmation: {
          select: { isConfirmed: true },
        },
      },
    });
  }
  async findTokenByUserId(userId: string): Promise<Token | null> {
    return this.prisma.token.findUnique({ where: { userId } });
  }
  async findUserByEmailConfirmationCode(
    code: string,
  ): Promise<UserWithEmailConfirmation | null> {
    return this.prisma.user.findFirst({
      where: {
        emailConfirmation: {
          confirmationCode: code,
        },
      },
      include: {
        emailConfirmation: {
          select: {
            confirmationCode: true,
            expirationDate: true,
            isConfirmed: true,
          },
        },
      },
    });
  }

  async updateEmailConfirmationCode(
    userEmail: string,
  ): Promise<EmailConfirmation> {
    return this.prisma.emailConfirmation.update({
      where: { userEmail },
      data: { isConfirmed: true },
    });
  }
  async updateEmailConfirmationInfo(
    userEmail: string,
  ): Promise<EmailConfirmation> {
    return this.prisma.emailConfirmation.update({
      where: { userEmail },
      data: {
        confirmationCode: randomUUID(),
        expirationDate: add(new Date(), {
          minutes: 1,
        }).toISOString(),
      },
    });
  }

  async updateUserTokens(
    userId: string,
    tokens: { accessTokenHash: string; refreshTokenHash: string },
  ) {
    return this.prisma.token.upsert({
      create: {
        accessTokenHash: tokens.accessTokenHash,
        refreshTokenHash: tokens.refreshTokenHash,
        userId,
      },
      update: {
        accessTokenHash: tokens.accessTokenHash,
        refreshTokenHash: tokens.refreshTokenHash,
      },
      where: {
        userId,
      },
    });
  }

  async logout(userId: string): Promise<boolean> {
    await this.prisma.token.updateMany({
      where: {
        userId,
        refreshTokenHash: {
          not: null,
        },
        accessTokenHash: {
          not: null,
        },
      },
      data: {
        refreshTokenHash: null,
        accessTokenHash: null,
      },
    });
    return true;
  }
}
