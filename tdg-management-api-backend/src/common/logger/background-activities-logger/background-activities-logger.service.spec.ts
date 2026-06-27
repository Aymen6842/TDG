import { Test, TestingModule } from '@nestjs/testing';
import { BackgroundActivitiesLoggerService } from './background-activities-logger.service';

describe('BackgroundActivitiesLoggerService', () => {
  let service: BackgroundActivitiesLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BackgroundActivitiesLoggerService],
    }).compile();

    service = module.get<BackgroundActivitiesLoggerService>(
      BackgroundActivitiesLoggerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
