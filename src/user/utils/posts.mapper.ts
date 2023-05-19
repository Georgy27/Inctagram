import { UserPosts } from '../types';

export class PostsMapper {
  public static toViewModel(model: [number, UserPosts[]]) {
    const [count, posts] = model;

    return {
      count,
      posts: posts.map((post) => {
        const previewUrl = post.images[0].previewUrl;
        const imagesCount = post.images.length;

        return {
          id: post.id,
          previewUrl,
          imagesCount,
          createdAt: post.createdAt,
        };
      }),
    };
  }
}
