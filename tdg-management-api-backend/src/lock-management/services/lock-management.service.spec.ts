import { Test, TestingModule } from '@nestjs/testing';
import { LockManagementService } from './lock-management.service';

describe('LockManagementService', () => {
  let service: LockManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LockManagementService],
    }).compile();

    service = module.get<LockManagementService>(LockManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
