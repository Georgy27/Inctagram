import * as bcrypt from 'bcrypt';

export class BcryptAdaptor {
  constructor() {}
  async generateSaltAndHash(password: string): Promise<string> {
    const passwordSalt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, passwordSalt);
    return hash;
  }
}
