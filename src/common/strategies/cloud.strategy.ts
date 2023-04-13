export abstract class CloudStrategy {
  public abstract upload(
    path: string,
    file: Express.Multer.File,
  ): Promise<string>;

  public abstract remove(path: string | string[]): Promise<void>;

  // public abstract removeAll(): Promise<void>;
}
