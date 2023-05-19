import { ApiProperty, PickType } from '@nestjs/swagger';
import { number } from 'joi';

import type { CreatePostResult, UserPost } from '.';

export class CreatePostResponse implements CreatePostResult {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public description: string;

  @ApiProperty()
  public userId: string;

  @ApiProperty({ type: () => [CreatePostResponseImage] })
  public images: CreatePostResponseImage[];

  @ApiProperty({ type: () => Date })
  public createdAt: Date;

  @ApiProperty({ type: () => Date })
  public updatedAt: Date;
}

export class GetUserPostResponse implements UserPost {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public description: string;

  @ApiProperty({ type: () => [GetUserPostsResponstImage] })
  public images: GetUserPostsResponstImage[];

  @ApiProperty({ type: () => Date })
  public createdAt: Date;

  @ApiProperty({ type: () => Date })
  public updatedAt: Date;
}

class CreatePostResponseMetadata {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public size: number;

  @ApiProperty()
  public width: number;

  @ApiProperty()
  public height: number;

  @ApiProperty()
  public imageId: string;

  @ApiProperty()
  public createdAt: Date;

  @ApiProperty()
  public updatedAt: Date;
}

class GetUserPostsResponseMetadata extends PickType(
  CreatePostResponseMetadata,
  ['width', 'height'] as const,
) {}

class CreatePostResponseImage {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public url: string;

  @ApiProperty()
  public previewUrl: string;

  @ApiProperty()
  public createdAt: Date;

  @ApiProperty()
  public updatedAt: Date;

  @ApiProperty()
  public postId: string;

  @ApiProperty()
  public metadata: CreatePostResponseMetadata;
}

class GetUserPostsResponstImage extends PickType(CreatePostResponseImage, [
  'url',
  'previewUrl',
] as const) {
  @ApiProperty()
  public metadata: GetUserPostsResponseMetadata;
}

export class Post {
  @ApiProperty()
  id: string;

  @ApiProperty()
  previewUrl: string;

  @ApiProperty()
  imagesCount: number;

  @ApiProperty()
  createdAt: Date;
}

export class PostsResponse {
  @ApiProperty()
  count: number;

  @ApiProperty({ type: [Post] })
  posts: Post[];
}
