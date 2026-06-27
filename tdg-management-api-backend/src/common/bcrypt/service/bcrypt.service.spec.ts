import { Test, TestingModule } from '@nestjs/testing';
import { BcryptService } from './bcrypt.service';

describe('BcryptService', () => {
  let service: BcryptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BcryptService],
    }).compile();

    service = module.get<BcryptService>(BcryptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('should return a hashed string', async () => {
      const data = 'password123';
      const hashed = await service.hash(data);

      expect(hashed).toBeDefined();
      expect(hashed).not.toEqual(data);
      expect(typeof hashed).toBe('string');
    });
  });

  describe('compare', () => {
    it('should return true for matching data and hash', async () => {
      const data = 'password123';
      const hashed = await service.hash(data);
      const isMatch = await service.compare(data, hashed);

      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching data and hash', async () => {
      const data = 'password123';
      const hashed = await service.hash(data);
      const isMatch = await service.compare('wrongpassword', hashed);

      expect(isMatch).toBe(false);
    });
  });
});
