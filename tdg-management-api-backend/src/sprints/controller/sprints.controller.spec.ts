import { Test, TestingModule } from '@nestjs/testing';
import { SprintsController } from './sprints.controller';
import { SprintsService } from '../services/sprints.service';
import { HasPermissionGuard } from 'src/auths/guards/has-permission.guard';
import { AgileOnlyGuard } from 'src/auths/guards/agile-only.guard';
import { Language, SprintStatus } from '@prisma/client';
import { CustomRequest } from 'src/common/types/request.type';
import { CreateSprintDto } from '../dto/request/post/create-sprint.dto';
import { UpdateSprintDto } from '../dto/request/update/update-sprint.dto';

describe('SprintsController', () => {
  let controller: SprintsController;
  let sprintsService: {
    createSprintForProject: jest.Mock;
    listSprints: jest.Mock;
    getSprintById: jest.Mock;
    updateSprint: jest.Mock;
    deleteSprint: jest.Mock;
    getSprintBurndown: jest.Mock;
    getVelocity: jest.Mock;
  };

  beforeEach(async () => {
    sprintsService = {
      createSprintForProject: jest.fn(),
      listSprints: jest.fn(),
      getSprintById: jest.fn(),
      updateSprint: jest.fn(),
      deleteSprint: jest.fn(),
      getSprintBurndown: jest.fn(),
      getVelocity: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SprintsController],
      providers: [{ provide: SprintsService, useValue: sprintsService }],
    })
      .overrideGuard(HasPermissionGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(AgileOnlyGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<SprintsController>(SprintsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createSprint', () => {
    it('should create a sprint', async () => {
      const dto = {
        content: [{ name: 'Sprint 1' }],
        startDate: '2026-03-01T00:00:00.000Z',
        endDate: '2026-03-14T00:00:00.000Z',
        estimatedStartDate: '2026-02-28T00:00:00.000Z',
        estimatedEndDate: '2026-03-15T00:00:00.000Z',
      };
      const mockSprint = {
        id: 'sprint-1',
        projectId: 'project-1',
        status: SprintStatus.Pending,
      };
      const req = { user: { id: 'user-1' } } as CustomRequest;

      sprintsService.createSprintForProject.mockResolvedValue(mockSprint);

      const result = await controller.createSprint(
        req,
        'project-1',
        {},
        dto as CreateSprintDto,
      );

      expect(sprintsService.createSprintForProject).toHaveBeenCalledWith(
        req,
        'project-1',
        {},
        dto,
      );
      expect(result).toEqual(mockSprint);
    });
  });

  describe('listSprints', () => {
    it('should return list of sprints', async () => {
      const mockSprints = {
        sprints: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      const req = { user: { id: 'user-1' } };
      const typedReq = req as CustomRequest;

      sprintsService.listSprints.mockResolvedValue(mockSprints);

      const result = await controller.listSprints(typedReq, 'project-1', {
        page: 1,
        limit: 10,
      });

      expect(sprintsService.listSprints).toHaveBeenCalledWith(
        req,
        'project-1',
        { page: 1, limit: 10 },
        undefined,
      );
      expect(result).toEqual(mockSprints);
    });
  });

  describe('getSprintById', () => {
    it('should return a sprint by id', async () => {
      const mockSprint = {
        id: 'sprint-1',
        projectId: 'project-1',
        status: SprintStatus.Pending,
      };
      const req = { user: { id: 'user-1' } } as CustomRequest;

      sprintsService.getSprintById.mockResolvedValue(mockSprint);

      const result = await controller.getSprintById(req, 'sprint-1');

      expect(sprintsService.getSprintById).toHaveBeenCalledWith(
        req,
        'sprint-1',
        undefined,
      );
      expect(result).toEqual(mockSprint);
    });
  });

  describe('updateSprint', () => {
    it('should update a sprint', async () => {
      const dto = { status: SprintStatus.Running };
      const mockSprint = { id: 'sprint-1', status: SprintStatus.Running };
      const req = { user: { id: 'user-1' } } as CustomRequest;

      sprintsService.updateSprint.mockResolvedValue(mockSprint);

      const result = await controller.updateSprint(
        req,
        'sprint-1',
        {},
        dto as UpdateSprintDto,
      );

      expect(sprintsService.updateSprint).toHaveBeenCalledWith(
        req,
        'sprint-1',
        {},
        dto,
      );
      expect(result).toEqual(mockSprint);
    });
  });

  describe('deleteSprint', () => {
    it('should delete a sprint', async () => {
      const req = { user: { id: 'user-1' } } as CustomRequest;

      sprintsService.deleteSprint.mockResolvedValue(undefined);

      await controller.deleteSprint(req, 'sprint-1');

      expect(sprintsService.deleteSprint).toHaveBeenCalledWith(req, 'sprint-1');
    });
  });

  describe('getSprintBurndown', () => {
    it('should return burndown data', async () => {
      const mockBurndown = {
        sprintId: 'sprint-1',
        sprintName: 'Sprint 1',
        totalPoints: 10,
        completedPoints: 5,
        remainingPoints: 5,
        completionPercentage: 50,
        totalTasks: 3,
        completedTasks: 1,
        chartData: [],
      };

      sprintsService.getSprintBurndown.mockResolvedValue(mockBurndown);

      const result = await controller.getSprintBurndown('sprint-1');

      expect(sprintsService.getSprintBurndown).toHaveBeenCalledWith(
        'sprint-1',
        undefined,
      );
      expect(result).toEqual(mockBurndown);
    });

    it('should pass language parameter', async () => {
      sprintsService.getSprintBurndown.mockResolvedValue({});

      await controller.getSprintBurndown('sprint-1', Language.English);

      expect(sprintsService.getSprintBurndown).toHaveBeenCalledWith(
        'sprint-1',
        'English',
      );
    });
  });

  describe('getVelocity', () => {
    it('should return velocity data', async () => {
      const req = { user: { id: 'user-1' } } as CustomRequest;
      const mockVelocity = {
        sprints: [],
        totalCompletedSprints: 0,
        totalCompletedPoints: 0,
        averageVelocity: 0,
      };

      sprintsService.getVelocity.mockResolvedValue(mockVelocity);

      const result = await controller.getVelocity(req, 'project-1');

      expect(sprintsService.getVelocity).toHaveBeenCalledWith(req, 'project-1');
      expect(result).toEqual(mockVelocity);
    });
  });
});
