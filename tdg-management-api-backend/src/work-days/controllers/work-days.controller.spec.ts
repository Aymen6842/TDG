import { Test, TestingModule } from '@nestjs/testing';
import { WorkDaysController } from './work-days.controller';

describe('WorkDaysController', () => {
  let controller: WorkDaysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkDaysController],
    }).compile();

    controller = module.get<WorkDaysController>(WorkDaysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
