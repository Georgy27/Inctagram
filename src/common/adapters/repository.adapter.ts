import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class QueryRepositoryAdapter {
  public abstract deleteAll(): Promise<any>;
}
