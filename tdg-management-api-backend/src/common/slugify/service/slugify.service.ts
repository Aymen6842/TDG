import { Injectable } from '@nestjs/common';
import slugify from 'slugify';

// Extend the slugify configuration globally
slugify.extend({ '/': '-' });
slugify.extend({ '+': ' plus ' });
slugify.extend({ '&': ' and ' });
slugify.extend({ '%': ' percent ' });

@Injectable()
export class SlugifyService {
  generateSlug(input: string) {
    return slugify(input, { strict: true, lower: true });
  }

  static toUnaccented(input: string) {
    return input
      .normalize('NFD') // Normalize to decomposed form
      .replace(/[\u0300-\u036f]/g, ''); // Remove diacritical marks
  }
}
