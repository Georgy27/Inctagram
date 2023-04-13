export const authStub = {
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
};
