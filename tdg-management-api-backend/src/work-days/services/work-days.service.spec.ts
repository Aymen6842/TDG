import { Test, TestingModule } from '@nestjs/testing';
import { WorkDaysService } from './work-days.service';

describe('WorkDaysService', () => {
  let service: WorkDaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkDaysService],
    }).compile();

    service = module.get<WorkDaysService>(WorkDaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
