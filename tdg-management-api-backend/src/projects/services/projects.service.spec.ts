import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { ConfigService } from '@nestjs/config';
import { CreateProjectRepository } from '../repositories/create-project.repository';
import { FetchProjectRepository } from '../repositories/fetch-project.repository';
import { UpdateProjectRepository } from '../repositories/update-project.repository';
import { DeleteProjectRepository } from '../repositories/delete-project.repository';
import { CreateInvitationRepository } from '../repositories/create-invitation.repository';
import { FetchInvitationRepository } from '../repositories/fetch-invitation.repository';
import { DeleteInvitationRepository } from '../repositories/delete-invitation.repository';
import {
  UserType,
  BusinessUnit,
  ProjectStatus,
  Language,
} from '@prisma/client';
import { MailService } from 'src/common/mail/service/mail.service';
import { NotificationsService } from 'src/notifications/services/notifications.service';
import { ForbiddenCustomException } from 'src/common/exceptions/custom-exceptions/forbidden.exception';
import { ConflictCustomException } from 'src/common/exceptions/custom-exceptions/conflict.exception';
import { BadRequestCustomException } from 'src/common/exceptions/custom-exceptions/bad-request.exception';
import { NotFoundCustomException } from 'src/common/exceptions/custom-exceptions/not-found.exception';
import { Prisma } from '@prisma/client';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let createProjectRepository: {
    createProject: jest.Mock;
    addMember: jest.Mock;
  };
  let fetchProjectRepository: {
    listProjects: jest.Mock;
    countProjects: jest.Mock;
    getProjectByIdWithPermission: jest.Mock;
    findMember: jest.Mock;
    getMemberById: jest.Mock;
    countManagers: jest.Mock;
    findUserByEmail: jest.Mock;
    findUserById: jest.Mock;
    getCapacitySnapshot: jest.Mock;
  };
  let updateProjectRepository: {
    updateProjectWithPermission: jest.Mock;
    findProjectById: jest.Mock;
    archiveProject: jest.Mock;
    restoreProject: jest.Mock;
    updateMember: jest.Mock;
  };
  let deleteProjectRepository: {
    deleteProjectWithPermission: jest.Mock;
    removeMember: jest.Mock;
  };
  let createInvitationRepository: {
    findExistingInvitation: jest.Mock;
    findExistingMember: jest.Mock;
    createInvitation: jest.Mock;
  };
  let fetchInvitationRepository: {
    getInvitationById: jest.Mock;
    getInvitationByToken: jest.Mock;
    updateInvitation: jest.Mock;
    updateInvitationStatus: jest.Mock;
  };
  let deleteInvitationRepository: {
    deleteInvitation: jest.Mock;
  };
  let mailService: {
    sendHtmlEmail: jest.Mock;
  };
  let notificationsService: {
    createNotification: jest.Mock;
  };

  const makeRequest = (roles: UserType[], userId = 'user-1') =>
    ({
      user: {
        id: userId,
        roles,
      },
    }) as any;

  const projectEntity = {
    id: 'project-1',
    paid: false,
    status: ProjectStatus.Pending,
    businessUnit: BusinessUnit.TawerDev,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    estimatedStartDate: new Date('2026-01-01'),
    estimatedEndDate: new Date('2026-12-31'),
    displayOrder: 10,
    createdById: 'creator-1',
    createdBy: { id: 'creator-1', name: 'Creator' },
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02'),
    members: [
      {
        id: 'member-1',
        userId: 'user-1',
        isManager: true,
        createdAt: new Date('2026-01-01'),
        user: { id: 'user-1', name: 'Manager User' },
      },
    ],
    contents: [
      {
        id: 'content-1',
        name: 'Project One',
        unaccentedName: 'Project One',
        description: 'desc',
        details: 'details',
        language: Language.English,
        createdAt: new Date('2026-01-01'),
      },
    ],
  };

  const createProjectDto = {
    businessUnit: BusinessUnit.TawerDev,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    estimatedStartDate: '2026-01-01',
    estimatedEndDate: '2026-12-31',
    members: [{ userId: 'user-1', isManager: true }],
    manager: 'user-1',
    contents: [
      {
        name: 'Projet Équipe',
        language: Language.English,
      },
    ],
  } as any;

  beforeEach(async () => {
    createProjectRepository = {
      createProject: jest.fn(),
      addMember: jest.fn(),
    };
    fetchProjectRepository = {
      listProjects: jest.fn(),
      countProjects: jest.fn(),
      getProjectByIdWithPermission: jest.fn(),
      findMember: jest.fn(),
      getMemberById: jest.fn().mockResolvedValue({
        id: 'member-1',
        userId: 'user-2',
        isManager: false,
        projectId: 'project-1',
      }),
      countManagers: jest.fn().mockResolvedValue(2),
      findUserByEmail: jest.fn(),
      findUserById: jest.fn(),
      getCapacitySnapshot: jest.fn(),
    };
    updateProjectRepository = {
      updateProjectWithPermission: jest.fn(),
      findProjectById: jest.fn().mockResolvedValue({
        id: 'project-1',
        isArchived: false,
        archivedAt: null,
      }),
      archiveProject: jest.fn(),
      restoreProject: jest.fn(),
      updateMember: jest.fn(),
    };
    deleteProjectRepository = {
      deleteProjectWithPermission: jest.fn(),
      removeMember: jest.fn(),
    };
    createInvitationRepository = {
      findExistingInvitation: jest.fn(),
      findExistingMember: jest.fn(),
      createInvitation: jest.fn(),
    };
    fetchInvitationRepository = {
      getInvitationById: jest.fn(),
      getInvitationByToken: jest.fn(),
      updateInvitation: jest.fn(),
      updateInvitationStatus: jest.fn(),
    };
    deleteInvitationRepository = {
      deleteInvitation: jest.fn(),
    };
    mailService = {
      sendHtmlEmail: jest.fn(),
    };
    notificationsService = {
      createNotification: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: CreateProjectRepository,
          useValue: createProjectRepository,
        },
        {
          provide: FetchProjectRepository,
          useValue: fetchProjectRepository,
        },
        {
          provide: UpdateProjectRepository,
          useValue: updateProjectRepository,
        },
        {
          provide: DeleteProjectRepository,
          useValue: deleteProjectRepository,
        },
        {
          provide: CreateInvitationRepository,
          useValue: createInvitationRepository,
        },
        {
          provide: FetchInvitationRepository,
          useValue: fetchInvitationRepository,
        },
        {
          provide: DeleteInvitationRepository,
          useValue: deleteInvitationRepository,
        },
        {
          provide: MailService,
          useValue: mailService,
        },
        {
          provide: NotificationsService,
          useValue: notificationsService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProject', () => {
    it('throws ForbiddenCustomException when role cannot create', async () => {
      await expect(
        service.createProject(
          makeRequest([UserType.BackendDeveloper]),
          createProjectDto,
        ),
      ).rejects.toBeInstanceOf(ForbiddenCustomException);
    });

    it('creates project and returns mapped response', async () => {
      createProjectRepository.createProject.mockResolvedValue(projectEntity);

      const result = await service.createProject(
        makeRequest([UserType.CEO]),
        createProjectDto,
      );

      expect(createProjectRepository.createProject).toHaveBeenCalledTimes(1);
      expect(createProjectRepository.createProject.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            createdById: 'user-1',
            contents: expect.arrayContaining([
              expect.objectContaining({
                name: createProjectDto.contents[0].name,
                language: Language.English,
                unaccentedName: expect.any(String),
              }),
            ]),
          }),
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: 'project-1',
        }),
      );
    });

    it('throws ConflictCustomException when project name already exists (P2002)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint violation',
        { code: 'P2002', clientVersion: '5.0.0' } as any,
      );
      createProjectRepository.createProject.mockRejectedValue(prismaError);

      await expect(
        service.createProject(makeRequest([UserType.CEO]), createProjectDto),
      ).rejects.toBeInstanceOf(ConflictCustomException);
    });
  });

  describe('listProjects', () => {
    it('uses unrestricted queries for executive users', async () => {
      fetchProjectRepository.listProjects.mockResolvedValue([projectEntity]);
      fetchProjectRepository.countProjects.mockResolvedValue(1);

      const query = { page: 1, limit: 10 } as any;
      const result = await service.listProjects(
        makeRequest([UserType.CEO]),
        query,
      );

      expect(fetchProjectRepository.listProjects).toHaveBeenCalledTimes(1);
      expect(fetchProjectRepository.listProjects.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            page: 1,
            limit: 10,
            userId: null,
          }),
          language: undefined,
        }),
      );

      expect(fetchProjectRepository.countProjects).toHaveBeenCalledTimes(1);
      expect(fetchProjectRepository.countProjects.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: null,
          }),
          language: undefined,
        }),
      );
      expect(result.pagination.records).toBe(1);
    });

    it('filters by current user for non-executive users', async () => {
      fetchProjectRepository.listProjects.mockResolvedValue([projectEntity]);
      fetchProjectRepository.countProjects.mockResolvedValue(1);

      const query = { page: 2, limit: 5 } as any;
      await service.listProjects(
        makeRequest([UserType.BackendDeveloper]),
        query,
      );

      expect(fetchProjectRepository.listProjects).toHaveBeenCalledTimes(1);
      expect(fetchProjectRepository.listProjects.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
          }),
          language: undefined,
        }),
      );

      expect(fetchProjectRepository.countProjects).toHaveBeenCalledTimes(1);
      expect(fetchProjectRepository.countProjects.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
          }),
          language: undefined,
        }),
      );
    });
  });

  describe('getProjectById', () => {
    it('throws ForbiddenCustomException when project does not exist (P2025)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: '5.0.0' } as any,
      );
      fetchProjectRepository.getProjectByIdWithPermission.mockRejectedValue(
        prismaError,
      );

      await expect(
        service.getProjectById(makeRequest([UserType.CEO]), 'project-1'),
      ).rejects.toBeInstanceOf(ForbiddenCustomException);
    });

    it('returns mapped project when user is member', async () => {
      fetchProjectRepository.getProjectByIdWithPermission.mockResolvedValue(
        projectEntity,
      );

      const result = await service.getProjectById(
        makeRequest([UserType.BackendDeveloper], 'user-1'),
        'project-1',
      );

      expect(
        fetchProjectRepository.getProjectByIdWithPermission,
      ).toHaveBeenCalledWith({
        projectId: 'project-1',
        userId: 'user-1',
      });
      expect(result.id).toBe('project-1');
    });

    it('returns project for executive without userId filter', async () => {
      fetchProjectRepository.getProjectByIdWithPermission.mockResolvedValue(
        projectEntity,
      );

      const result = await service.getProjectById(
        makeRequest([UserType.CEO]),
        'project-1',
      );

      expect(
        fetchProjectRepository.getProjectByIdWithPermission,
      ).toHaveBeenCalledWith({
        projectId: 'project-1',
        userId: null,
      });
      expect(result.id).toBe('project-1');
    });
  });

  describe('getProjectCapacity', () => {
    it('returns computed capacity breakdown for accessible project', async () => {
      fetchProjectRepository.findMember.mockResolvedValue({
        id: 'member-1',
        userId: 'user-1',
        projectId: 'project-1',
        isManager: true,
      });
      fetchProjectRepository.getCapacitySnapshot.mockResolvedValue({
        id: 'project-1',
        members: [
          { userId: 'user-1', user: { name: 'Manager User' } },
          { userId: 'user-2', user: { name: 'Dev User' } },
        ],
        sprints: [
          {
            id: 's1',
            capacity: 20,
            status: 'Running',
            tasks: [
              { storyPoints: 8, assigneeId: 'user-1' },
              { storyPoints: 5, assigneeId: 'user-2' },
              { storyPoints: 2, assigneeId: null },
            ],
          },
        ],
      });

      const result = await service.getProjectCapacity(
        makeRequest([UserType.ProductOwner], 'user-1'),
        'project-1',
      );

      expect(fetchProjectRepository.getCapacitySnapshot).toHaveBeenCalledWith({
        projectId: 'project-1',
      });
      expect(result.totalCapacityPoints).toBe(20);
      expect(result.totalCommittedPoints).toBe(15);
      expect(result.unassignedCommittedPoints).toBe(2);
      expect(result.members).toHaveLength(2);
    });
  });

  describe('updateProject', () => {
    it('throws BadRequestCustomException when businessUnit is sent in update payload', async () => {
      await expect(
        service.updateProject(makeRequest([UserType.CEO]), 'project-1', {
          businessUnit: BusinessUnit.TawerCreative,
        } as any),
      ).rejects.toBeInstanceOf(BadRequestCustomException);
    });

    it('throws ForbiddenCustomException when project not found (P2025)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: '5.0.0' } as any,
      );
      updateProjectRepository.updateProjectWithPermission.mockRejectedValue(
        prismaError,
      );

      await expect(
        service.updateProject(makeRequest([UserType.CEO]), 'project-1', {
          status: ProjectStatus.Running,
        } as any),
      ).rejects.toBeInstanceOf(ForbiddenCustomException);
    });

    it('updates project when user is authorized', async () => {
      updateProjectRepository.updateProjectWithPermission.mockResolvedValue(
        projectEntity,
      );

      const dto = {
        status: ProjectStatus.Running,
        contents: [
          {
            name: 'Updated Name',
            language: Language.English,
          },
        ],
      } as any;
      const result = await service.updateProject(
        makeRequest([UserType.CEO]),
        'project-1',
        dto,
      );

      expect(
        updateProjectRepository.updateProjectWithPermission,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            projectId: 'project-1',
            userId: null,
            businessUnit: null,
          },
          projectData: expect.objectContaining({
            status: ProjectStatus.Running,
            contents: [
              {
                name: 'Updated Name',
                language: Language.English,
                unaccentedName: 'Updated Name',
              },
            ],
          }),
        }),
      );
      expect(result.id).toBe('project-1');
    });

    it('throws ConflictCustomException when update name would duplicate (P2002)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint violation',
        { code: 'P2002', clientVersion: '5.0.0' } as any,
      );
      updateProjectRepository.updateProjectWithPermission.mockRejectedValue(
        prismaError,
      );

      await expect(
        service.updateProject(makeRequest([UserType.CEO]), 'project-1', {
          contents: [{ name: 'duplicate', language: Language.English }],
        } as any),
      ).rejects.toBeInstanceOf(ConflictCustomException);
    });
  });

  describe('deleteProject', () => {
    it('throws ForbiddenCustomException when project does not exist (P2025)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: '5.0.0' } as any,
      );
      deleteProjectRepository.deleteProjectWithPermission.mockRejectedValue(
        prismaError,
      );

      await expect(
        service.deleteProject(makeRequest([UserType.CEO]), 'project-1'),
      ).rejects.toBeInstanceOf(ForbiddenCustomException);
    });

    it('deletes project for authorized role', async () => {
      deleteProjectRepository.deleteProjectWithPermission.mockResolvedValue(
        undefined,
      );

      await service.deleteProject(makeRequest([UserType.CEO]), 'project-1');

      expect(
        deleteProjectRepository.deleteProjectWithPermission,
      ).toHaveBeenCalledWith({
        projectId: 'project-1',
        businessUnit: null,
      });
    });

    it('deletes project with business unit filter for CTO', async () => {
      deleteProjectRepository.deleteProjectWithPermission.mockResolvedValue(
        undefined,
      );

      await service.deleteProject(makeRequest([UserType.CTO]), 'project-1');

      expect(
        deleteProjectRepository.deleteProjectWithPermission,
      ).toHaveBeenCalledWith({
        projectId: 'project-1',
        businessUnit: 'TawerDev',
      });
    });
  });

  // ================================================================
  // Project Archive (Phase 6)
  // ================================================================

  describe('archiveProject', () => {
    const archivedProjectEntity = {
      id: 'project-1',
      paid: false,
      status: ProjectStatus.Running,
      businessUnit: BusinessUnit.TawerDev,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      estimatedStartDate: new Date('2026-01-01'),
      estimatedEndDate: new Date('2026-12-31'),
      displayOrder: 10,
      createdById: 'creator-1',
      createdByName: 'Creator',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02'),
      isArchived: true,
      archivedAt: new Date('2026-03-01'),
      members: [],
      contents: [],
    };

    it('should archive a project', async () => {
      updateProjectRepository.findProjectById.mockResolvedValue({
        id: 'project-1',
        isArchived: false,
        archivedAt: null,
      });
      updateProjectRepository.archiveProject.mockResolvedValue(
        archivedProjectEntity,
      );

      const result = await service.archiveProject('project-1');

      expect(updateProjectRepository.findProjectById).toHaveBeenCalledWith({
        projectId: 'project-1',
      });
      expect(updateProjectRepository.archiveProject).toHaveBeenCalledWith({
        projectId: 'project-1',
      });
      expect(result.isArchived).toBe(true);
    });

    it('should throw NotFoundCustomException when project not found', async () => {
      updateProjectRepository.findProjectById.mockResolvedValue(null);

      await expect(service.archiveProject('invalid-id')).rejects.toThrow(
        NotFoundCustomException,
      );
    });

    it('should throw BadRequestCustomException when project already archived', async () => {
      updateProjectRepository.findProjectById.mockResolvedValue({
        id: 'project-1',
        isArchived: true,
        archivedAt: new Date('2026-03-01'),
      });

      await expect(service.archiveProject('project-1')).rejects.toThrow(
        BadRequestCustomException,
      );
    });
  });

  describe('restoreProject', () => {
    const restoredProjectEntity = {
      id: 'project-1',
      paid: false,
      status: ProjectStatus.Running,
      businessUnit: BusinessUnit.TawerDev,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      estimatedStartDate: new Date('2026-01-01'),
      estimatedEndDate: new Date('2026-12-31'),
      displayOrder: 10,
      createdById: 'creator-1',
      createdByName: 'Creator',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02'),
      isArchived: false,
      archivedAt: null,
      members: [],
      contents: [],
    };

    it('should restore an archived project', async () => {
      updateProjectRepository.findProjectById.mockResolvedValue({
        id: 'project-1',
        isArchived: true,
        archivedAt: new Date('2026-03-01'),
      });
      updateProjectRepository.restoreProject.mockResolvedValue(
        restoredProjectEntity,
      );

      const result = await service.restoreProject('project-1');

      expect(updateProjectRepository.findProjectById).toHaveBeenCalledWith({
        projectId: 'project-1',
      });
      expect(updateProjectRepository.restoreProject).toHaveBeenCalledWith({
        projectId: 'project-1',
      });
      expect(result.isArchived).toBe(false);
    });

    it('should throw NotFoundCustomException when project not found', async () => {
      updateProjectRepository.findProjectById.mockResolvedValue(null);

      await expect(service.restoreProject('invalid-id')).rejects.toThrow(
        NotFoundCustomException,
      );
    });

    it('should throw BadRequestCustomException when project is not archived', async () => {
      updateProjectRepository.findProjectById.mockResolvedValue({
        id: 'project-1',
        isArchived: false,
        archivedAt: null,
      });

      await expect(service.restoreProject('project-1')).rejects.toThrow(
        BadRequestCustomException,
      );
    });
  });

  // ================================================================
  // Member Management
  // ================================================================

  describe('addMember', () => {
    it('should add a member when user has access', async () => {
      fetchProjectRepository.findMember.mockResolvedValue(null);
      createProjectRepository.addMember.mockResolvedValue({
        id: 'member-new',
        userId: 'user-2',
        projectId: 'project-1',
        isManager: false,
      });

      const result = await service.addMemberSmart({
        req: makeRequest([UserType.CEO]),
        projectId: 'project-1',
        userId: 'user-2',
        isManager: false,
      });

      expect(createProjectRepository.addMember).toHaveBeenCalledWith({
        projectId: 'project-1',
        userId: 'user-2',
        isManager: false,
      });
      expect(result).toHaveProperty('id', 'member-new');
    });

    it('should throw ConflictCustomException when member already exists', async () => {
      fetchProjectRepository.findMember.mockResolvedValue({
        id: 'member-existing',
      });

      await expect(
        service.addMemberSmart({
          req: makeRequest([UserType.CEO]),
          projectId: 'project-1',
          userId: 'user-2',
          isManager: false,
        }),
      ).rejects.toBeInstanceOf(ConflictCustomException);
    });

    it('should throw ForbiddenCustomException when non-executive non-member', async () => {
      fetchProjectRepository.findMember.mockResolvedValue(null);

      await expect(
        service.addMemberSmart({
          req: makeRequest([UserType.BackendDeveloper]),
          projectId: 'project-1',
          userId: 'user-2',
          isManager: false,
        }),
      ).rejects.toBeInstanceOf(ForbiddenCustomException);
    });
  });

  describe('updateMember', () => {
    it('should update member role', async () => {
      updateProjectRepository.updateMember.mockResolvedValue({
        id: 'member-1',
        userId: 'user-2',
        isManager: true,
      });

      const result = await service.updateMember({
        req: makeRequest([UserType.CEO]),
        projectId: 'project-1',
        memberId: 'member-1',
        isManager: true,
      });

      expect(updateProjectRepository.updateMember).toHaveBeenCalledWith({
        memberId: 'member-1',
        projectId: 'project-1',
        isManager: true,
      });
      expect(result).toHaveProperty('isManager', true);
    });

    it('should throw NotFoundCustomException when member not found (P2025)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: '5.0.0' } as any,
      );
      updateProjectRepository.updateMember.mockRejectedValue(prismaError);

      await expect(
        service.updateMember({
          req: makeRequest([UserType.CEO]),
          projectId: 'project-1',
          memberId: 'member-invalid',
          isManager: true,
        }),
      ).rejects.toBeInstanceOf(NotFoundCustomException);
    });
  });

  describe('removeMember', () => {
    it('should remove a member', async () => {
      deleteProjectRepository.removeMember.mockResolvedValue(undefined);

      await service.removeMember({
        req: makeRequest([UserType.CEO]),
        projectId: 'project-1',
        memberId: 'member-1',
      });

      expect(deleteProjectRepository.removeMember).toHaveBeenCalledWith({
        memberId: 'member-1',
        projectId: 'project-1',
      });
    });

    it('should throw NotFoundCustomException when member not found (P2025)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: '5.0.0' } as any,
      );
      deleteProjectRepository.removeMember.mockRejectedValue(prismaError);

      await expect(
        service.removeMember({
          req: makeRequest([UserType.CEO]),
          projectId: 'project-1',
          memberId: 'member-invalid',
        }),
      ).rejects.toBeInstanceOf(NotFoundCustomException);
    });
  });
});
