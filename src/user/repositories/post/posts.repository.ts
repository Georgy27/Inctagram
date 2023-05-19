import { Injectable } from '@nestjs/common';
import { Post, Prisma, PrismaClient } from '@prisma/client';
import { DatabaseError } from 'src/common/errors';
import { UpdatePostDto } from 'src/user/dto/update-post.dto';
import { PostsRepositoryAdapter } from '../adapters/post/posts.adapter';

@Injectable()
export class PostsRepository extends PostsRepositoryAdapter<Post> {
  public constructor(private readonly prisma: PrismaClient) {
    super();
  }

  public async deletePost(userId: string, postId: string): Promise<void> {
    try {
      await this.prisma.post.deleteMany({
        where: {
          userId,
          id: postId,
        },
      });
    } catch (error) {
      console.log(error);

      throw new DatabaseError((<Error>error).message);
    }
  }

  public async deleteAll(): Promise<Prisma.BatchPayload> {
    try {
      const result = await this.prisma.post.deleteMany();

      return result;
    } catch (error) {
      console.log(error);

      throw new DatabaseError((<Error>error).message);
    }
  }

  public async updatePost(
    userId: string,
    postId: string,
    payload: UpdatePostDto,
  ): Promise<Prisma.BatchPayload> {
    try {
      const { description } = payload;

      const result = await this.prisma.post.updateMany({
        where: {
          id: postId,
          userId,
        },
        data: {
          description,
        },
      });

      return result;
    } catch (error) {
      console.log(error);

      throw new DatabaseError((<Error>error).message);
    }
  }
}
