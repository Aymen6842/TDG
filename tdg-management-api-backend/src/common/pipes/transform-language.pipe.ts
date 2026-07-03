import { PipeTransform } from '@nestjs/common';
import { Language } from '@prisma/client';

export class TransformLanguagePipe implements PipeTransform {
  transform(value?: string) {
    return Language.English;
  }
}
