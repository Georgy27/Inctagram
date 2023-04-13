import Joi from 'joi';

export const configValidationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  YANDEX_BUCKET_NAME: Joi.string().required(),
  YANDEX_STORAGE_API_KEY_ID: Joi.string().required(),
  YANDEX_STORAGE_API_KEY: Joi.string().required(),
  GMAIL_EMAIL: Joi.string().required(),
  GMAIL_PASSWORD: Joi.string().required(),
});
