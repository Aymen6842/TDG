import { Injectable } from '@nestjs/common';
import { genSalt, compare, hash } from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class BcryptService {
  public async hash(data: string) {
    const salt = await genSalt();
    return hash(data, salt);
  }

  public hashDataForFacebook(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  public async compare(data: string, encrypted: string) {
    const access = await compare(data, encrypted);
    return access;
  }

  public encryptData(data: string, secret: string): string {
    const key = crypto.scryptSync(secret, 'salt', 32);
    const iv = Buffer.alloc(16, 0);

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  public decryptData(encryptedData: string, secret: string): string {
    const key = crypto.scryptSync(secret, 'salt', 32);
    const iv = Buffer.alloc(16, 0);

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  public hashDataDeterministic(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
