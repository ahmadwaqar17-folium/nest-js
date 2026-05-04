import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Hashing } from '../hashing/hashing';

@Injectable()
export class Bcrypt extends Hashing {
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
