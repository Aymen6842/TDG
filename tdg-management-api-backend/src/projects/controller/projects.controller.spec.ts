import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { BusinessUnit } from '@prisma/client';

import { ProjectsController } from './projects.controller';
import { ProjectsService } from '../services/projects.service';
import { Permissions } from 'src/auths/decorators/permissions.decorator';
import { HasPermissionGuard } from 'src/auths/guards/has-permission.guard';
import { IsAuthenticatedGuard } from 'src/auths/guards/is-authenticated.guard';
import { PERMISSIONS } from 'src/common/constants/permissions';
import { ConflictCustomException } from 'src/common/exceptions/custom-exceptions/conflict.exception';
import { BadRequestCustomException } from 'src/common/exceptions/custom-exceptions/bad-request.exception';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let reflector: Reflector;
  let projectsService: {
    createProject: jest.Mock;
    listProjects: jest.Mock;
    getProjectById: jest.Mock;
    getProjectCapacity: jest.Mock;
    updateProject: jest.Mock;
    deleteProject: jest.Mock;
    acceptInvitation: jest.Mock;
  };

  beforeEach(() => {
    reflector = new Reflector();
    projectsService = {
      createProject: jest.fn(),
      listProjects: jest.fn(),
      getProjectById: jest.fn(),
      getProjectCapacity: jest.fn(),
      updateProject: jest.fn(),
      deleteProject: jest.fn(),
      acceptInvitation: jest.fn(),
    };

    controller = new ProjectsController(
      projectsService as unknown as ProjectsService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates createProject to service', async () => {
    const req = { user: { id: 'u1' } } as unknown as any;
    const dto = { name: 'Project' } as unknown as any;
    const expected = { id: 'p1' };
    projectsService.createProject.mockResolvedValue(expected);

    const result = await controller.createProject(req, dto);

    expect(projectsService.createProject).toHaveBeenCalledWith(req, dto);
    expect(result).toEqual(expected);
  });

  it('delegates listProjects to service', async () => {
    const req = { user: { id: 'u1' } } as unknown as any;
    const query = { page: 1, limit: 10 } as unknown as any;
    const expected = {
      projects: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
    projectsService.listProjects.mockResolvedValue(expected);

    const result = await controller.listProjects(req, query, undefined);

    expect(projectsService.listProjects).toHaveBeenCalledWith(
      req,
      query,
      undefined,
    );
    expect(result).toEqual(expected);
  });

  it('delegates getProjectById to service', async () => {
    const req = { user: { id: 'u1' } } as unknown as any;
    const expected = { id: 'p1' };
    projectsService.getProjectById.mockResolvedValue(expected);

    const result = await controller.getProjectById(req, 'p1');

    expect(projectsService.getProjectById).toHaveBeenCalledWith(req, 'p1');
    expect(result).toEqual(expected);
  });

  it('delegates getProjectCapacity to service', async () => {
    const req = { user: { id: 'u1' } } as unknown as any;
    const expected = { projectId: 'p1', totalCapacityPoints: 30 };
    projectsService.getProjectCapacity.mockResolvedValue(expected);

    const result = await controller.getProjectCapacity(req, 'p1');

    expect(projectsService.getProjectCapacity).toHaveBeenCalledWith(req, 'p1');
    expect(result).toEqual(expected);
  });

  it('delegates updateProject to service', async () => {
    const req = { user: { id: 'u1' } } as unknown as any;
    const dto = { name: 'Updated' } as unknown as any;
    const expected = { id: 'p1', name: 'Updated' };
    projectsService.updateProject.mockResolvedValue(expected);

    const result = await controller.updateProject(req, 'p1', dto);

    expect(projectsService.updateProject).toHaveBeenCalledWith(req, 'p1', dto);
    expect(result).toEqual(expected);
  });

  it('delegates deleteProject to service', async () => {
    const req = { user: { id: 'u1' } } as unknown as any;
    projectsService.deleteProject.mockResolvedValue(undefined);

    await controller.deleteProject(req, 'p1');

    expect(projectsService.deleteProject).toHaveBeenCalledWith(req, 'p1');
  });

  it('delegates acceptInvitation to service', async () => {
    const req = { user: { id: 'u1' } } as unknown as any;
    const dto = { token: 'invite-token' } as unknown as any;
    const expected = { id: 'member-1', projectId: 'p1', userId: 'u1' };
    projectsService.acceptInvitation.mockResolvedValue(expected);

    const result = await controller.acceptInvitation(req, dto);

    expect(projectsService.acceptInvitation).toHaveBeenCalledWith({
      req,
      dto,
    });
    expect(result).toEqual(expected);
  });

  it('adds PROJECT_DELETE permission metadata to deleteProject', () => {
    const permissions = reflector.get(
      Permissions,
      ProjectsController.prototype.deleteProject,
    );

    expect(permissions).toEqual([PERMISSIONS.PROJECTS.PROJECT_DELETE]);
  });

  it('uses IsAuthenticatedGuard for acceptInvitation', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      ProjectsController.prototype.acceptInvitation,
    ) as Array<new (...args: never[]) => unknown>;

    expect(guards).toEqual([IsAuthenticatedGuard]);
  });

  it('keeps HasPermissionGuard for deleteProject', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      ProjectsController.prototype.deleteProject,
    ) as Array<new (...args: never[]) => unknown>;

    expect(guards).toEqual([HasPermissionGuard]);
  });

  // ==================== P6001: Duplicate Name Tests ====================

  it('throws ConflictCustomException when creating project with duplicate name', async () => {
    const req = { user: { id: 'u1' } } as unknown as any;
    const dto = { name: 'Existing Project' } as unknown as any;
    projectsService.createProject.mockRejectedValue(
      new ConflictCustomException(
        'Project with this name already exists',
        'P6001',
      ),
    );

    await expect(controller.createProject(req, dto)).rejects.toBeInstanceOf(
      ConflictCustomException,
    );
  });

  it('throws ConflictCustomException when updating project with duplicate name', async () => {
    const req = { user: { id: 'u1' } } as unknown as any;
    const dto = { name: 'Duplicate Name' } as unknown as any;
    projectsService.updateProject.mockRejectedValue(
      new ConflictCustomException(
        'Project with this name already exists',
        'P6001',
      ),
    );

    await expect(
      controller.updateProject(req, 'p1', dto),
    ).rejects.toBeInstanceOf(ConflictCustomException);
  });

  // ==================== P6005: Immutable BusinessUnit Tests ====================

  it('throws BadRequestCustomException when trying to update businessUnit', async () => {
    const req = { user: { id: 'u1' } } as unknown as any;
    const dto = { businessUnit: BusinessUnit.TawerCreative } as unknown as any;
    projectsService.updateProject.mockRejectedValue(
      new BadRequestCustomException(
        'Business unit cannot be changed after creation',
        'P6005',
      ),
    );

    await expect(
      controller.updateProject(req, 'p1', dto),
    ).rejects.toBeInstanceOf(BadRequestCustomException);
  });
});
