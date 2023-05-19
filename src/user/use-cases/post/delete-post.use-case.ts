import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Post } from '@prisma/client';

import { PostsRepositoryAdapter } from 'src/user/repositories/adapters/post/posts.adapter';

export class DeletePostCommand {
  public constructor(
    public readonly userId: string,
    public readonly postId: string,
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  public constructor(
    private readonly postsRepository: PostsRepositoryAdapter<Post>,
  ) {}

  public async execute(command: DeletePostCommand): Promise<void> {
    const { userId, postId } = command;

    await this.postsRepository.deletePost(userId, postId);
  }
}
