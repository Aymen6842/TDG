import { Test, TestingModule } from '@nestjs/testing';
import { SlugifyService } from './slugify.service';

describe('SlugifyService', () => {
  let service: SlugifyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SlugifyService],
    }).compile();

    service = module.get<SlugifyService>(SlugifyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('slugify', () => {
    it('should convert a string to a slug', () => {
      const input = 'Hello World!';
      const expected = 'hello-world';
      const result = service.generateSlug(input);
      expect(result).toBe(expected);
    });

    it('should handle strings with special characters', () => {
      const input = 'This is a test! @#$%^&*()';
      const expected = 'this-is-a-test-dollar-pourcent-et';
      const result = service.generateSlug(input);
      expect(result).toBe(expected);
    });

    it('should handle strings with multiple spaces', () => {
      const input = '   Multiple   spaces   ';
      const expected = 'multiple-spaces';
      const result = service.generateSlug(input);
      expect(result).toBe(expected);
    });

    it('should return an empty string for empty input', () => {
      const input = '';
      const expected = '';
      const result = service.generateSlug(input);
      expect(result).toBe(expected);
    });

    it('should handle non-ASCII characters', () => {
      const input = 'Café au lait';
      const expected = 'cafe-au-lait';
      const result = service.generateSlug(input);
      expect(result).toBe(expected);
    });
  });
});
