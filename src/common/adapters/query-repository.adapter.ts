import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class QueryRepositoryAdapter {
  public abstract findById(id: string): Promise<any>;
}
