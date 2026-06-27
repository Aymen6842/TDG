import { Test, TestingModule } from '@nestjs/testing';
import { NtfyService } from './ntfy.service';

describe('NtfyService', () => {
  let service: NtfyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NtfyService],
    }).compile();

    service = module.get<NtfyService>(NtfyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
