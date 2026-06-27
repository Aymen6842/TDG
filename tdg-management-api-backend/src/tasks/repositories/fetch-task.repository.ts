import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { TaskQueryDto } from '../dto/request/fetch/task-query.dto';
import { Prisma, ProjectType, BusinessUnit } from '@prisma/client';

export type KanbanBoardTask = {
  id: string;
  key: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  assigneeId: string | null;
  sprintId: string | null;
  epicId: string | null;
  milestoneId: string | null;
  storyPoints: number | null;
  displayOrder: number;
  isFavorite: boolean;
  archived: boolean;
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
  labels: {
    label: {
      id: string;
      name: string;
      color: string;
    };
  }[];
  _count: {
    subtasks: number;
  };
};

// After label flattening in the service
export type KanbanBoardTaskFlat = Omit<KanbanBoardTask, 'labels'> & {
  labels: { id: string; name: string; color: string }[];
};

export type KanbanWipLimits = Record<string, number>;

export type ProjectWithKanbanSettings = {
  id: string;
  projectType: ProjectType;
  kanbanSettings: KanbanWipLimits | null;
};

@Injectable()
export class FetchTaskRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  /**
   * Build the select object for full task details
   * Note: orderBy for comments must be added in the query itself
   */
  private buildSelectForDetails() {
    return {
      id: true,
      projectId: true,
      key: true,
      type: true,
      priority: true,
      status: true,
      title: true,
      description: true,
      storyPoints: true,
      estimatedHours: true,
      actualHours: true,
      progressPercent: true,
      milestoneId: true,
      reporterId: true,
      assigneeId: true,
      sprintId: true,
      epicId: true,
      parentTaskId: true,
      dueDate: true,
      completedAt: true,
      displayOrder: true,
      isFavorite: true,
      archived: true,
      createdAt: true,
      updatedAt: true,
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      sprint: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
          status: true,
        },
      },
      epic: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      milestone: {
        select: {
          id: true,
          name: true,
          dueDate: true,
        },
      },
      parentTask: {
        select: {
          id: true,
          key: true,
          title: true,
        },
      },
      subtasks: {
        select: {
          id: true,
          key: true,
          title: true,
          type: true,
          priority: true,
          status: true,
          displayOrder: true,
        },
      },
      comments: {
        select: {
          id: true,
          content: true,
          authorId: true,
          createdAt: true,
          updatedAt: true,
          mentions: {
            select: {
              id: true,
              userId: true,
            },
          },
          likes: {
            select: {
              id: true,
              userId: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc' as const,
        },
      },
      taskDependenciesAsBlocked: {
        select: {
          id: true,
          blockingTaskId: true,
          blockedTaskId: true,
          dependencyType: true,
          createdAt: true,
        },
      },
      taskDependenciesAsBlocking: {
        select: {
          id: true,
          blockingTaskId: true,
          blockedTaskId: true,
          dependencyType: true,
          createdAt: true,
        },
      },
      attachments: {
        select: {
          id: true,
          file: true,
          createdAt: true,
        },
      },
      labels: {
        select: {
          label: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      },
      _count: {
        select: {
          subtasks: true,
          comments: true,
        },
      },
    };
  }

  /**
   * Build the select object for list view
   */
  private buildSelectForList() {
    return {
      id: true,
      projectId: true,
      key: true,
      title: true,
      type: true,
      priority: true,
      status: true,
      assigneeId: true,
      sprintId: true,
      epicId: true,
      storyPoints: true,
      milestoneId: true,
      progressPercent: true,
      reporterId: true,
      dueDate: true,
      displayOrder: true,
      isFavorite: true,
      archived: true,
      createdAt: true,
      updatedAt: true,
      assignee: {
        select: {
          id: true,
          name: true,
        },
      },
      labels: {
        select: {
          label: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      },
      _count: {
        select: {
          subtasks: true,
          comments: true,
        },
      },
    };
  }

  /**
   * Build the where clause from query filters.
   * When projectId is undefined the clause is not scoped to a single project
   * (used for cross-project user-task queries).
   */
  private buildWhereClause(
    projectId: string | undefined,
    filters?: TaskQueryDto,
  ): Prisma.TaskWhereInput {
    const where: Prisma.TaskWhereInput = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (!filters) return where;

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }

    if (filters.sprintId) {
      where.sprintId = filters.sprintId;
    }

    if (filters.epicId) {
      where.epicId = filters.epicId;
    }

    if (filters.milestoneId) {
      where.milestoneId = filters.milestoneId;
    }

    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) {
        where.dueDate.gte = new Date(filters.dueDateFrom);
      }
      if (filters.dueDateTo) {
        where.dueDate.lte = new Date(filters.dueDateTo);
      }
    }

    if (filters.isFavorite !== undefined) {
      where.isFavorite = filters.isFavorite;
    }

    if (filters.archived !== undefined) {
      where.archived = filters.archived;
    }

    if (filters.labelName) {
      where.labels = {
        some: { label: { name: filters.labelName } },
      };
    }

    return where;
  }

  /**
   * Build orderBy from sortBy parameter
   */
  private buildOrderBy(sortBy?: string): Prisma.TaskOrderByWithRelationInput[] {
    const effectiveSortBy = sortBy ?? 'createdAtDesc';

    // Keep business ordering stable: displayOrder is always primary.
    const orderBy: Prisma.TaskOrderByWithRelationInput[] = [
      { displayOrder: 'asc' },
    ];

    switch (effectiveSortBy) {
      case 'displayOrderAsc':
        break;
      case 'displayOrderDesc':
        orderBy.push({ displayOrder: 'desc' });
        break;
      case 'priorityAsc':
        orderBy.push({ priority: 'asc' });
        break;
      case 'priorityDesc':
        orderBy.push({ priority: 'desc' });
        break;
      case 'dueDateAsc':
        orderBy.push({ dueDate: 'asc' });
        break;
      case 'dueDateDesc':
        orderBy.push({ dueDate: 'desc' });
        break;
      case 'createdAtAsc':
        orderBy.push({ createdAt: 'asc' });
        break;
      case 'createdAtDesc':
        orderBy.push({ createdAt: 'desc' });
        break;
      case 'titleAsc':
        orderBy.push({ title: 'asc' });
        break;
      case 'titleDesc':
        orderBy.push({ title: 'desc' });
        break;
      default:
        orderBy.push({ createdAt: 'desc' });
        break;
    }

    // Deterministic fallback ordering when previous keys are equal.
    orderBy.push({ createdAt: 'desc' }, { id: 'asc' });

    return orderBy;
  }

  findTaskAssigneeAndTitle(data: { taskId: string }) {
    return this.prismaService.task.findUniqueOrThrow({
      where: { id: data.taskId },
      select: { id: true, assigneeId: true, title: true },
    });
  }

  findById(data: { taskId: string }) {
    return this.prismaService.task.findUniqueOrThrow({
      where: { id: data.taskId },
      select: this.buildSelectForDetails(),
    });
  }

  findByIdInProject(data: { taskId: string; projectId: string }) {
    return this.prismaService.task.findFirstOrThrow({
      where: { id: data.taskId, projectId: data.projectId },
      select: this.buildSelectForDetails(),
    });
  }

  findByProjectAndKey(data: { projectId: string; key: string }) {
    return this.prismaService.task.findUnique({
      where: {
        projectId_key: {
          projectId: data.projectId,
          key: data.key,
        },
      },
    });
  }

  findAll(data: { projectId: string; filters: TaskQueryDto }) {
    const { skip = 0, take = 10 } = data.filters;

    const where = this.buildWhereClause(data.projectId, data.filters);
    const orderBy = this.buildOrderBy(data.filters.sortBy);

    return this.prismaService.task.findMany({
      where,
      skip,
      take,
      orderBy,
      select: this.buildSelectForList(),
    });
  }

  countTasks(data: { projectId: string; filters: TaskQueryDto }) {
    const where = this.buildWhereClause(data.projectId, data.filters);

    return this.prismaService.task.count({ where });
  }

  findBySprint(data: {
    projectId: string;
    sprintId: string;
    filters?: { isFavorite?: boolean; archived?: boolean };
  }) {
    const where: Prisma.TaskWhereInput = {
      projectId: data.projectId,
      sprintId: data.sprintId,
    };

    if (data.filters?.isFavorite !== undefined) {
      where.isFavorite = data.filters.isFavorite;
    }

    if (data.filters?.archived !== undefined) {
      where.archived = data.filters.archived;
    }

    return this.prismaService.task.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        key: true,
        title: true,
        type: true,
        priority: true,
        status: true,
        assigneeId: true,
        storyPoints: true,
        displayOrder: true,
        isFavorite: true,
        archived: true,
        createdAt: true,
        labels: {
          select: {
            label: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
      },
    });
  }

  findSprintInProject(data: { projectId: string; sprintId: string }) {
    return this.prismaService.sprint.findFirst({
      where: {
        id: data.sprintId,
        projectId: data.projectId,
      },
      select: { id: true },
    });
  }

  findEpicInProject(data: { projectId: string; epicId: string }) {
    return this.prismaService.epic.findFirst({
      where: {
        id: data.epicId,
        projectId: data.projectId,
      },
      select: { id: true },
    });
  }

  findMilestoneInProject(data: { projectId: string; milestoneId: string }) {
    return this.prismaService.milestone.findFirst({
      where: {
        id: data.milestoneId,
        projectId: data.projectId,
      },
      select: { id: true },
    });
  }

  findByEpic(data: { epicId: string }) {
    return this.prismaService.task.findMany({
      where: { epicId: data.epicId },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        key: true,
        title: true,
        type: true,
        priority: true,
        status: true,
        assigneeId: true,
        sprintId: true,
        storyPoints: true,
        displayOrder: true,
        isFavorite: true,
        archived: true,
        createdAt: true,
        labels: {
          select: {
            label: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
      },
    });
  }

  findBacklog(data: {
    projectId: string;
    filters?: { isFavorite?: boolean; archived?: boolean };
  }) {
    const where: Prisma.TaskWhereInput = {
      projectId: data.projectId,
      sprintId: null,
      parentTaskId: null,
    };

    if (data.filters?.isFavorite !== undefined) {
      where.isFavorite = data.filters.isFavorite;
    }

    if (data.filters?.archived !== undefined) {
      where.archived = data.filters.archived;
    }

    return this.prismaService.task.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        key: true,
        title: true,
        type: true,
        priority: true,
        status: true,
        assigneeId: true,
        storyPoints: true,
        displayOrder: true,
        isFavorite: true,
        archived: true,
        createdAt: true,
        labels: {
          select: {
            label: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
      },
    });
  }

  async findProjectType(data: { projectId: string }): Promise<ProjectType> {
    const project = await this.prismaService.project.findUniqueOrThrow({
      where: { id: data.projectId },
      select: { projectType: true },
    });
    return project.projectType;
  }

  async findProjectBusinessUnit(data: {
    projectId: string;
  }): Promise<BusinessUnit | null> {
    const project = await this.prismaService.project.findUnique({
      where: { id: data.projectId },
      select: { businessUnit: true },
    });
    return project?.businessUnit ?? null;
  }

  async findKanban(data: {
    projectId: string;
    options: { sprintId?: string; epicId?: string };
  }) {
    const where: Prisma.TaskWhereInput = {
      projectId: data.projectId,
      parentTaskId: null,
    };

    if (data.options.sprintId) {
      where.sprintId = data.options.sprintId;
    }

    if (data.options.epicId) {
      where.epicId = data.options.epicId;
    }

    const tasks = await this.prismaService.task.findMany({
      where,
      orderBy: [{ status: 'asc' }, { displayOrder: 'asc' }],
      select: {
        id: true,
        key: true,
        title: true,
        type: true,
        priority: true,
        status: true,
        assigneeId: true,
        sprintId: true,
        epicId: true,
        milestoneId: true,
        storyPoints: true,
        displayOrder: true,
        isFavorite: true,
        archived: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        labels: {
          select: {
            label: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
        _count: {
          select: {
            subtasks: true,
          },
        },
      },
    });

    // Return raw tasks grouped by status
    return tasks as KanbanBoardTask[];
  }

  async findProjectWithKanbanSettings(data: { projectId: string }) {
    const project = await this.prismaService.project.findUniqueOrThrow({
      where: { id: data.projectId },
      select: { id: true, projectType: true, kanbanSettings: true },
    });

    // Convert Json to proper type and projectType to enum
    return {
      ...project,
      projectType: project.projectType,
      kanbanSettings: project.kanbanSettings as KanbanWipLimits | null,
    } as ProjectWithKanbanSettings;
  }

  countTasksByStatus(data: { projectId: string; status: string }) {
    return this.prismaService.task.count({
      where: {
        projectId: data.projectId,
        status: data.status,
        parentTaskId: null,
      },
    });
  }

  getTimeEntries(data: { taskId: string }) {
    return this.prismaService.taskTimeEntry.findMany({
      where: { taskId: data.taskId },
      select: {
        id: true,
        taskId: true,
        userId: true,
        workSessionId: true,
        hours: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findMembership(data: { userId: string; projectId: string }) {
    return this.prismaService.projectMember.findUniqueOrThrow({
      where: {
        projectId_userId: {
          projectId: data.projectId,
          userId: data.userId,
        },
      },
      select: { id: true, userId: true, projectId: true, isManager: true },
    });
  }

  findBlockingDependencies(data: { taskId: string }) {
    return this.prismaService.taskDependency.findMany({
      where: {
        blockedTaskId: data.taskId,
        dependencyType: 'blocks',
        blockingTask: {
          status: { not: 'DONE' },
        },
      },
      select: {
        id: true,
        blockingTask: {
          select: { id: true, title: true },
        },
      },
    });
  }

  findDependencies(data: { taskId: string; blockedTaskId?: string }) {
    const where: Prisma.TaskDependencyWhereInput = {
      blockedTaskId: data.taskId,
    };
    if (data.blockedTaskId) {
      where.blockingTaskId = data.blockedTaskId;
    }
    return this.prismaService.taskDependency.findMany({
      where,
    });
  }

  countTasksInProject(data: { taskIds: string[]; projectId: string }) {
    return this.prismaService.task.count({
      where: {
        id: { in: data.taskIds },
        projectId: data.projectId,
      },
    });
  }

  findAssignedToUser(data: { userId: string; filters: TaskQueryDto }) {
    const { skip = 0, take = 10 } = data.filters;
    const where = this.buildWhereClause(undefined, {
      ...data.filters,
      assigneeId: data.userId,
    });
    const orderBy = this.buildOrderBy(data.filters.sortBy);

    return this.prismaService.task.findMany({
      where,
      skip,
      take,
      orderBy,
      select: this.buildSelectForList(),
    });
  }

  countAssignedToUser(data: { userId: string; filters: TaskQueryDto }) {
    const where = this.buildWhereClause(undefined, {
      ...data.filters,
      assigneeId: data.userId,
    });

    return this.prismaService.task.count({ where });
  }
}
