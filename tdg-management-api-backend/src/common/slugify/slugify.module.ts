import { Module } from '@nestjs/common';
import { SlugifyService } from './service/slugify.service';

@Module({
  exports: [SlugifyService],
  providers: [SlugifyService],
})
export class SlugifyModule {}
