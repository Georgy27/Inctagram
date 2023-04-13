import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class ImagesQueryRepositoryAdapter<T> {
  public abstract findByUserId(id: string): Promise<T | null>;
}
