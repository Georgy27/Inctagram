import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
} from '@nestjs/swagger';
import {
  CreatePostResponse,
  GetUserPostResponse,
  PostsResponse,
} from 'src/user/types/swagger';

DeletePostApiDecorator;
CreatePostApiDecorator;
UpdatePostApiDecorator;
GetPostsApiDecorator;
GetPostApiDecorator;

export function DeletePostApiDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete user post',
    }),
    ApiNoContentResponse({
      description: 'Post has been successfully deleted',
    }),
    ApiInternalServerErrorResponse({
      description: 'An error occurs when attempting to delete the post.',
    }),
    ApiBearerAuth(),
  );
}

class CreatePostRequestBody {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: true,
  })
  public files: string[];

  @ApiProperty({
    required: false,
    type: 'string',
  })
  public description: string;
}

export function CreatePostApiDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create user post',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'File to upload',
      type: CreatePostRequestBody,
    }),
    ApiCreatedResponse({
      description: 'Post has been successfully created',
      type: CreatePostResponse,
    }),
    ApiInternalServerErrorResponse({
      description: 'An error occurs when attempting to create the post.',
    }),
    ApiBearerAuth(),
  );
}

export function UpdatePostApiDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update user post',
    }),
    ApiNoContentResponse({
      description: 'Post has been successfully updated',
    }),
    ApiInternalServerErrorResponse({
      description: 'An error occurs when attempting to update the post.',
    }),
    ApiBearerAuth(),
  );
}

export function GetPostsApiDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user posts',
    }),
    ApiOkResponse({
      type: PostsResponse,
      isArray: true,
    }),
    ApiInternalServerErrorResponse({
      description: 'An error occurs when attempting to get posts from database',
    }),
    ApiBearerAuth(),
  );
}

export function GetPostApiDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user post',
    }),
    ApiOkResponse({
      type: GetUserPostResponse,
    }),
    ApiInternalServerErrorResponse({
      description: 'An error occurs when attempting to get post from database',
    }),
    ApiBearerAuth(),
  );
}
