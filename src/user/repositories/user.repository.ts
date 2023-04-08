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
    return this.prisma.user.create({
      data: {
        userName: createUserDto.userName,
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
  async findUserByUserName(userName: string) {
    return this.prisma.user.findUnique({
      where: { userName },
      include: {
        emailConfirmation: {
          select: { isConfirmed: true },
        },
      },
    });
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
  async findUserByConfirmationOrRecoveryCode(code: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          {
            emailConfirmation: {
              confirmationCode: code,
            },
          },
          {
            passwordRecovery: {
              recoveryCode: code,
            },
          },
        ],
      },
      include: {
        emailConfirmation: {
          select: {
            confirmationCode: true,
            expirationDate: true,
            isConfirmed: true,
          },
        },
        passwordRecovery: {
          select: {
            recoveryCode: true,
            expirationDate: true,
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

  async updatePasswordRecoveryCode(userId: string, recoveryCode: string) {
    return this.prisma.passwordRecovery.update({
      where: { userId },
      data: {
        recoveryCode,
        expirationDate: add(new Date(), {
          minutes: 10,
        }).toISOString(),
      },
    });
  }

  async updatePassword(id: string, hash: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        hash,
        passwordRecovery: {
          update: {
            recoveryCode: null,
            expirationDate: null,
          },
        },
      },
    });
  }
}
