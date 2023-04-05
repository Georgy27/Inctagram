import { AuthDto } from '../../../src/auth/dto/auth.dto';
import { LoginDto } from '../../../src/auth/dto/login.dto';

export const authStub = {
  registration(): AuthDto {
    return {
      email: 'Georgetest@yandex.ru',
      password: 'George123',
    };
  },
  login(): LoginDto {
    return {
      email: 'George123@test.com',
      password: 'George123',
    };
  },
  getUser() {},
};
