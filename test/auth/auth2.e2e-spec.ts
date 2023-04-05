// import { INestApplication } from '@nestjs/common';
// import * as request from 'supertest';
// import { MailBoxImap } from '../imap.service';
// import * as cheerio from 'cheerio';
// import { isUUID } from '@nestjs/common/utils/is-uuid';
// import {
//   createAppFor2E2Tests,
//   createDescribeName,
//   endpoints,
//   methods,
//   wipeAllData,
// } from '../e2e.helpers';
// import { minutesToMilliseconds } from 'date-fns';
//
// describe('AuthController (e2e)', () => {
//   jest.setTimeout(minutesToMilliseconds(3));
//
//   // Jest STATE: {mailBox, validConfirmationCode, newValidConfirmationCode}
//   let app: INestApplication;
//
//   const preparedData = {
//     valid: {
//       login: 'Gleb',
//       email: 'hleb.lukashonak@yandex.by',
//       password: 'testing',
//       newLogin: 'Test',
//       newEmail: 'gleb.luk.go@gmail.com',
//     },
//     invalid: {
//       login: 'invalidLogin1234567890',
//       email: 'invalidEmail',
//       password: 'invalidPasswordInvalidPassword',
//       confirmationCode: 'invalidConfirmationCode',
//     },
//   };
//
//   beforeAll(async () => {
//     // createAppFor2E2Tests => see in e2e.helpers
//     app = await createAppFor2E2Tests(app);
//     await app.init();
//
//     const mailBox = new MailBoxImap();
//     await mailBox.connectToMail();
//
//     expect.setState({ mailBox });
//   });
//
//   afterAll(async () => {
//     await app.close();
//     const mailBox: MailBoxImap = expect.getState().mailBox;
//     await mailBox.disconnect();
//   });
//
//   describe(
//     createDescribeName(methods.delete, endpoints.testingController.allData),
//     () => {
//       it('should wipe all data in DB and return 204 status code', async () => {
//         const response = await wipeAllData(request, app);
//         expect(response.status).toBe(204);
//         expect(response.body).toEqual({});
//       });
//     },
//   );
//
//   describe(
//     createDescribeName(methods.post, endpoints.authController.registration),
//     () => {
//       const registrationUrl = endpoints.authController.registration;
//
//       it('send wrong login should return 400 status code and error message, ', async () => {
//         const response = await request(app.getHttpServer())
//           .post(registrationUrl)
//           .send({
//             login: preparedData.invalid.login,
//             email: preparedData.valid.email,
//             password: preparedData.valid.password,
//           });
//         expect(response.status).toBe(400);
//         expect(response.body).toEqual({
//           errorsMessages: [
//             {
//               message: 'login must be shorter than or equal to 10 characters',
//               field: 'login',
//             },
//           ],
//         });
//       });
//
//       it('send wrong email should return 400 status code and error message, ', async () => {
//         const response = await request(app.getHttpServer())
//           .post(registrationUrl)
//           .send({
//             login: preparedData.valid.login,
//             email: preparedData.invalid.email,
//             password: preparedData.valid.password,
//           });
//         expect(response.status).toBe(400);
//         expect(response.body).toEqual({
//           errorsMessages: [
//             {
//               message: 'email must be an email',
//               field: 'email',
//             },
//           ],
//         });
//       });
//
//       it('send wrong password should return 400 status code and error message, ', async () => {
//         const response = await request(app.getHttpServer())
//           .post(registrationUrl)
//           .send({
//             login: preparedData.valid.login,
//             email: preparedData.valid.email,
//             password: preparedData.invalid.password,
//           });
//         expect(response.status).toBe(400);
//         expect(response.body).toEqual({
//           errorsMessages: [
//             {
//               message:
//                 'password must be shorter than or equal to 20 characters',
//               field: 'password',
//             },
//           ],
//         });
//       });
//
//       it('should create new User and return 204 status code', async () => {
//         const response = await request(app.getHttpServer())
//           .post(registrationUrl)
//           .send({
//             login: preparedData.valid.login,
//             email: preparedData.valid.email,
//             password: preparedData.valid.password,
//           });
//         expect(response.status).toBe(204);
//         expect(response.body).toEqual({});
//       });
//
//       it('should read email and get validConfirmationCode', async () => {
//         const mailBox: MailBoxImap = expect.getState().mailBox;
//         const email = await mailBox.waitNewMessage(2);
//         const html = await mailBox.getMessageHtml(email);
//         expect(html).not.toBeNull();
//         const link = cheerio.load(html).root().find('a').attr('href');
//         const validConfirmationCode = link.split('?')[1].split('=')[1];
//         expect(validConfirmationCode).not.toBeNull();
//         expect(validConfirmationCode).not.toBeUndefined();
//         const isUuid = isUUID(validConfirmationCode);
//         expect(isUuid).toBeTruthy();
//         // if (isUuid) await mailBox.deleteAllTodayMessages();
//         expect.setState({ validConfirmationCode });
//       });
//
//       it('should return error because LOGIN already in DB', async () => {
//         const response = await request(app.getHttpServer())
//           .post(registrationUrl)
//           .send({
//             login: preparedData.valid.login,
//             email: preparedData.valid.newEmail,
//             password: preparedData.valid.password,
//           });
//         expect(response.status).toBe(400);
//         expect(response.body).toEqual({
//           errorsMessages: [
//             {
//               message: 'this login has already been created',
//               field: 'login',
//             },
//           ],
//         });
//       });
//
//       it('should return error because EMAIL already in DB', async () => {
//         const response = await request(app.getHttpServer())
//           .post(registrationUrl)
//           .send({
//             login: preparedData.valid.newLogin,
//             email: preparedData.valid.email,
//             password: preparedData.valid.password,
//           });
//         expect(response.status).toBe(400);
//         expect(response.body).toEqual({
//           errorsMessages: [
//             {
//               message: 'this email has already been created',
//               field: 'email',
//             },
//           ],
//         });
//       });
//     },
//   );
//
//   describe(
//     createDescribeName(
//       methods.post,
//       endpoints.authController.registrationEmailResending,
//     ),
//     () => {
//       const registrationEmailResendingUrl =
//         endpoints.authController.registrationEmailResending;
//
//       it('should return error because email is invalid', async () => {
//         const response = await request(app.getHttpServer())
//           .post(registrationEmailResendingUrl)
//           .send({
//             email: preparedData.invalid.email,
//           });
//         expect(response.status).toBe(400);
//       });
//
//       it('should return error because email is not in DB', async () => {
//         const response = await request(app.getHttpServer())
//           .post(registrationEmailResendingUrl)
//           .send({
//             email: `${preparedData.invalid.email}@gmail.com`,
//           });
//         expect(response.status).toBe(400);
//         expect(response.body).toEqual({
//           errorsMessages: [
//             { message: 'user with this email was not found', field: 'email' },
//           ],
//         });
//       });
//
//       it('should send new email with new confirmationCode', async () => {
//         const response = await request(app.getHttpServer())
//           .post(registrationEmailResendingUrl)
//           .send({
//             email: preparedData.valid.email,
//           });
//         expect(response.status).toBe(204);
//         const mailBox: MailBoxImap = expect.getState().mailBox;
//         const email = await mailBox.waitNewMessage(2);
//         const html = await mailBox.getMessageHtml(email);
//         expect(html).not.toBeNull();
//         const link = cheerio.load(html).root().find('a').attr('href');
//         const newValidConfirmationCode = link.split('?')[1].split('=')[1];
//         expect(newValidConfirmationCode).not.toBeNull();
//         expect(newValidConfirmationCode).not.toBeUndefined();
//         const isUuid = isUUID(newValidConfirmationCode);
//         expect(isUuid).toBeTruthy();
//         const validConfirmationCode = expect.getState().validConfirmationCode;
//         expect(newValidConfirmationCode).not.toEqual(validConfirmationCode);
//         expect.setState({ newValidConfirmationCode });
//       });
//     },
//   );
//
//   // TODO: login & reg-confirm
//   describe(`${createDescribeName(
//     methods.post,
//     endpoints.authController.registrationConfirmation,
//   )} && ${createDescribeName(
//     methods.post,
//     endpoints.authController.login,
//   )}`, () => {
//     it('', async () => {});
//   });
// });
