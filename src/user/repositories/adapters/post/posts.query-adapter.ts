import { Injectable } from '@nestjs/common';

import type { UserPost, UserPosts } from 'src/user/types';
import { PostsQueryDto } from 'src/user/dto/posts-query.dto';

@Injectable()
export abstract class PostsQueryRepositoryAdatapter {
  public abstract getPostsByQuery(
    userId: string,
    postsQuery: PostsQueryDto,
  ): Promise<[number, UserPosts[]]>;

  public abstract getPostById(
    userId: string,
    postId: string,
  ): Promise<UserPost | null>;
}
