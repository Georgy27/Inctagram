import { User } from '@prisma/client';

export interface UserWithEmailConfirmation extends User {
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: string;
    isConfirmed: boolean;
  } | null;
}
