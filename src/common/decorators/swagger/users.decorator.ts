import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ABOUT_ME_LENGTH_MAX,
  ABOUT_ME_LENGTH_MIN,
  CITY_LENGTH_MAX,
  CITY_LENGTH_MIN,
  MIN_AVATAR_HEIGHT,
  MIN_AVATAR_WIDTH,
  NAME_LENGTH_MAX,
  NAME_LENGTH_MIN,
  SURNAME_LENGTH_MAX,
  SURNAME_LENGTH_MIN,
} from 'src/common/constants';
import { FieldError } from 'src/types';

export function UploadUserAvatarApiDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Upload user avatar with preview',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'File to upload',
      required: true,
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
    ApiBearerAuth(),
    ApiCreatedResponse({
      status: 201,
      description: 'User avatar has been successfuly uploaded',
      schema: {
        type: 'object',
        example: {
          url: 'https://cloud.image.png',
          previewUrl: 'https://cloud.preview.image.png',
        },
      },
    }),
    ApiBadRequestResponse({
      description: `If the InputModel has incorrect values \n
    1. Image dimensions are less than ${MIN_AVATAR_WIDTH}px x ${MIN_AVATAR_HEIGHT}px \n
    2. Wrong format (png, jpeg, jpg are allowed) \n
    3. Image size > 2Mb
    `,
      type: FieldError,
    }),
    ApiNotFoundResponse({
      description: 'User with such id was not found',
      type: FieldError,
    }),
    ApiInternalServerErrorResponse({
      description: 'Could not upload a file',
      type: FieldError,
    }),
  );
}

export function GetProfileApiDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Return self user profile',
    }),
    ApiResponse({
      status: 200,
      description: 'Success',
      schema: {
        type: 'object',
        example: {
          username: 'Licence_to_kill',
          name: 'James',
          surname: 'Bond',
          birthday: '007 - 007 - 007',
          city: 'London',
          aboutMe: 'Bond, James Bond...',
          avatar: {
            url: 'http://cloud.image.png',
            previewUrl: 'http://cloud.preview.image.png',
          },
        },
      },
    }),
    ApiForbiddenResponse({
      description:
        'If user profile already exists, or if the user has not confirmed their emai',
      type: FieldError,
    }),
    ApiUnauthorizedResponse({
      description: 'JWT accessToken is missing, expired or incorrect',
    }),
    ApiBearerAuth(),
  );
}

export function CreateProfileApiDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create user profile',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['name', 'surname', 'city'],
        properties: {
          name: {
            type: 'string',
            minimum: NAME_LENGTH_MIN,
            maximum: NAME_LENGTH_MAX,
            example: 'James',
          },
          surname: {
            type: 'string',
            minimum: SURNAME_LENGTH_MIN,
            maximum: SURNAME_LENGTH_MAX,
            example: 'Bond',
          },
          birthday: {
            type: 'Date',
            example: '007 - 007 - 007',
          },
          city: {
            type: 'string',
            minimum: CITY_LENGTH_MIN,
            maximum: CITY_LENGTH_MAX,
            example: 'London',
          },
          aboutMe: {
            type: 'string',
            minimum: ABOUT_ME_LENGTH_MIN,
            maximum: ABOUT_ME_LENGTH_MAX,
            example: 'Bond, James Bond...',
          },
        },
      },
    }),
    ApiNoContentResponse({
      description: 'User account has been created',
    }),
    ApiBadRequestResponse({
      description: 'If the InputModel has incorrect values, ',
      type: FieldError,
    }),
    ApiNotFoundResponse({
      description: 'User with such id was not found',
    }),
    ApiUnauthorizedResponse({
      description: 'JWT accessToken is missing, expired or incorrect',
    }),
    ApiForbiddenResponse({
      description:
        'If account has been already created, or if the user has not confirmed their emai',
    }),
    ApiBearerAuth(),
  );
}

export function UpdateProfileApiDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update user profile',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minimum: NAME_LENGTH_MIN,
            maximum: NAME_LENGTH_MAX,
            example: 'James',
          },
          surname: {
            type: 'string',
            minimum: SURNAME_LENGTH_MIN,
            maximum: SURNAME_LENGTH_MAX,
            example: 'Bond',
          },
          birthday: {
            type: 'Date',
            example: '007 - 007 - 007',
          },
          city: {
            type: 'string',
            minimum: CITY_LENGTH_MIN,
            maximum: CITY_LENGTH_MAX,
            example: 'London',
          },
          aboutMe: {
            type: 'string',
            minimum: ABOUT_ME_LENGTH_MIN,
            maximum: ABOUT_ME_LENGTH_MAX,
            example: 'Bond, James Bond...',
          },
        },
      },
    }),
    ApiNoContentResponse({
      description: 'User account has been updated',
    }),
    ApiBadRequestResponse({
      description: 'If the InputModel has incorrect values',
      type: FieldError,
    }),
    ApiNotFoundResponse({
      description: 'User with such id or corresponding account was not found',
    }),
    ApiUnauthorizedResponse({
      description: 'JWT accessToken is missing, expired or incorrect',
    }),
    ApiForbiddenResponse({
      description: 'The user has not confirmed their emai',
    }),
    ApiBearerAuth(),
  );
}
