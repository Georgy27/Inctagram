import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class RepositoryAdapter {
  public abstract deleteAll(): Promise<any>;
}
