import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

export type ProjectTaskStatusRecord = {
  id: string;
  projectId: string;
  name: string;
  color: string;
  order: number;
  isSystem: boolean;
  isDefault: boolean;
  isArchived: boolean;
  allowedTransitions: string[];
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class TaskStatusesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findAllByProject(data: {
    projectId: string;
  }): Promise<ProjectTaskStatusRecord[]> {
    return this.prismaService.projectTaskStatus.findMany({
      where: { projectId: data.projectId, isArchived: false },
      orderBy: { order: 'asc' },
    });
  }

  findByIdInProject(data: {
    statusId: string;
    projectId: string;
  }): Promise<ProjectTaskStatusRecord | null> {
    return this.prismaService.projectTaskStatus.findFirst({
      where: {
        id: data.statusId,
        projectId: data.projectId,
        isArchived: false,
      },
    });
  }

  findByNameInProject(data: {
    projectId: string;
    name: string;
  }): Promise<ProjectTaskStatusRecord | null> {
    return this.prismaService.projectTaskStatus.findFirst({
      where: {
        projectId: data.projectId,
        name: data.name,
        isArchived: false,
      },
    });
  }

  async getMaxOrder(data: { projectId: string }): Promise<number> {
    const result = await this.prismaService.projectTaskStatus.aggregate({
      where: { projectId: data.projectId },
      _max: { order: true },
    });
    return result._max.order ?? 0;
  }

  createStatus(data: {
    projectId: string;
    name: string;
    color: string;
    order: number;
    isSystem?: boolean;
    isDefault?: boolean;
    allowedTransitions?: string[];
  }) {
    return this.prismaService.projectTaskStatus.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        color: data.color,
        order: data.order,
        isSystem: data.isSystem ?? false,
        isDefault: data.isDefault ?? false,
        allowedTransitions: data.allowedTransitions ?? [],
      },
      select: {
        id: true,
        projectId: true,
        name: true,
        color: true,
        order: true,
        isSystem: true,
        isDefault: true,
        isArchived: true,
        allowedTransitions: true,
        createdAt: true,
      },
    });
  }

  updateStatus(data: {
    statusId: string;
    name?: string;
    color?: string;
    order?: number;
    isDefault?: boolean;
    allowedTransitions?: string[];
    isArchived?: boolean;
  }) {
    return this.prismaService.projectTaskStatus.update({
      where: { id: data.statusId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
        ...(data.allowedTransitions !== undefined && {
          allowedTransitions: data.allowedTransitions,
        }),
        ...(data.isArchived !== undefined && { isArchived: data.isArchived }),
      },
      select: {
        id: true,
        projectId: true,
        name: true,
        color: true,
        order: true,
        isSystem: true,
        isDefault: true,
        isArchived: true,
        allowedTransitions: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  deleteStatus(data: { statusId: string }) {
    return this.prismaService.projectTaskStatus.delete({
      where: { id: data.statusId },
    });
  }

  countTasksUsingStatus(data: {
    projectId: string;
    statusName: string;
  }): Promise<number> {
    return this.prismaService.task.count({
      where: {
        projectId: data.projectId,
        status: data.statusName as any, // Dynamic status - not constrained to enum
      },
    });
  }

  async seedDefaultsForProject(data: {
    projectId: string;
    projectType: 'AGILE' | 'FREESTYLE';
  }): Promise<void> {
    const agileDefaults = [
      {
        name: 'BACKLOG',
        color: '#94A3B8',
        order: 1,
        isDefault: true,
        allowedTransitions: ['TODO'],
      },
      {
        name: 'TODO',
        color: '#60A5FA',
        order: 2,
        isDefault: false,
        allowedTransitions: ['BACKLOG', 'IN_PROGRESS'],
      },
      {
        name: 'IN_PROGRESS',
        color: '#FBBF24',
        order: 3,
        isDefault: false,
        allowedTransitions: ['TODO', 'IN_REVIEW'],
      },
      {
        name: 'IN_REVIEW',
        color: '#F97316',
        order: 4,
        isDefault: false,
        allowedTransitions: ['IN_PROGRESS', 'TESTING'],
      },
      {
        name: 'TESTING',
        color: '#A78BFA',
        order: 5,
        isDefault: false,
        allowedTransitions: ['IN_REVIEW', 'DONE'],
      },
      {
        name: 'DONE',
        color: '#34D399',
        order: 6,
        isDefault: false,
        allowedTransitions: ['TESTING'],
      },
    ];
    const freestyleDefaults = [
      {
        name: 'TODO',
        color: '#60A5FA',
        order: 1,
        isDefault: true,
        allowedTransitions: ['IN_PROGRESS'],
      },
      {
        name: 'IN_PROGRESS',
        color: '#FBBF24',
        order: 2,
        isDefault: false,
        allowedTransitions: ['TODO', 'DONE'],
      },
      {
        name: 'DONE',
        color: '#34D399',
        order: 3,
        isDefault: false,
        allowedTransitions: ['IN_PROGRESS'],
      },
    ];
    const defaults =
      data.projectType === 'AGILE' ? agileDefaults : freestyleDefaults;
    await this.prismaService.projectTaskStatus.createMany({
      data: defaults.map((d) => ({
        ...d,
        projectId: data.projectId,
        isSystem: true,
        isArchived: false,
      })),
    });
  }

  async clearDefaultsForProject(data: { projectId: string }): Promise<void> {
    await this.prismaService.projectTaskStatus.updateMany({
      where: { projectId: data.projectId },
      data: { isDefault: false },
    });
  }

  async reorderStatuses(data: {
    projectId: string;
    statusUpdates: Array<{ id: string; order: number }>;
  }): Promise<void> {
    const updatePromises = data.statusUpdates.map(({ id, order }) =>
      this.prismaService.projectTaskStatus.update({
        where: { id },
        data: { order },
      }),
    );
    await Promise.all(updatePromises);
  }
}
