export const authStub = {
  passwordRecovery: {
    recoveryCode: '123',
  },
  tokens: {
    deviceSession1: {
      accessToken: '123',
      refreshToken: '123',
    },
    deviceSession2: {
      accessToken: '123',
      refreshToken: '123',
    },
  },
  registration: {
    validUser: {
      username: 'George',
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
  login: {
    email: 'Aegoraa@yandex.ru',
    password: 'George123',
    invalidUserEmail: {
      email: true,
      password: 'George123',
    },
    invalidUserPassword: {
      email: 'Aegoraa@yandex.ru',
      password: 123456,
    },
    invalidUser: {
      email: true,
      password: 123456,
    },
    incorrectUserEmail: {
      email: 'Incorrect@yandex.ru',
      password: 'George123',
    },
    incorrectUserPassword: {
      email: 'Aegoraa@yandex.ru',
      password: '123456',
    },
    incorrectUser: {
      email: 'Incorrect@yandex.ru',
      password: '123456',
    },
  },

  setPasswordRecoveryCode(code: string) {
    this.passwordRecovery.recoveryCode = code;
  },

  getPasswordRecoveryCode() {
    return this.passwordRecovery.recoveryCode;
  },

  setUserDeviceSession1Tokens(refreshToken: string, accessToken?: string) {
    this.tokens.deviceSession1.refreshToken = refreshToken;
    if (accessToken) this.tokens.deviceSession1.accessToken = accessToken;
  },

  getUserDeviceSession1Tokens() {
    return this.tokens.deviceSession1;
  },

  setUserDeviceSession2Tokens(refreshToken: string, accessToken?: string) {
    this.tokens.deviceSession2.refreshToken = refreshToken;
    if (accessToken) this.tokens.deviceSession2.accessToken = accessToken;
  },

  getUserDeviceSession2Tokens() {
    return this.tokens.deviceSession2;
  },
};
