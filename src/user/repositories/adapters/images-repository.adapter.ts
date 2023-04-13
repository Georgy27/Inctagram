import { Injectable } from '@nestjs/common';
import { QueryRepositoryAdapter } from 'src/common/adapters/repository.adapter';

@Injectable()
export abstract class ImagesRepositoryAdapter<
  T,
> extends QueryRepositoryAdapter {
  public abstract create(id: string, payload: Partial<T>): Promise<T | null>;
}
