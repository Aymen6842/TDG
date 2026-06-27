import { Module } from '@nestjs/common';
import { BcryptService } from './service/bcrypt.service';

@Module({
  providers: [BcryptService],
  exports: [BcryptService],
})
export class BcryptModule {}
