import { PipeTransform } from '@nestjs/common';
import { Language } from '@prisma/client';

export class TransformLanguagePipe implements PipeTransform {
  transform(value?: string) {
    if (value === 'ar') return Language.Arabic;
    if (value === 'fr') return Language.French;

    return Language.English;
  }
}
