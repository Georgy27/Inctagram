import { AuthDto } from '../../../src/auth/dto/auth.dto';
import { LoginDto } from '../../../src/auth/dto/login.dto';

export const authStub = {
  registration: {
    validUser: {
      email: 'Aegoraa@yandex.ru',
      password: 'George123',
    },
    userWithEmptyEmail: {
      email: '',
      password: 'emptyemail',
    },
    userWithInvalidEmail: {
      email: 'invalidUserEmail',
      password: 'invalidMail',
    },
    userWithLongPassword: {
      email: 'valid@mail.com',
      password: 'thispasswordistoolong',
    },
  },
};
