import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

export type ProjectTaskLabel = {
  id: string;
  projectId: string;
  name: string;
  color: string;
};

@Injectable()
export class TaskLabelsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  createLabel(data: { projectId: string; name: string; color: string }) {
    return this.prismaService.taskLabel.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        color: data.color,
      },
      select: {
        id: true,
        projectId: true,
        name: true,
        color: true,
        createdAt: true,
      },
    });
  }

  findAllByProject(data: { projectId: string }) {
    return this.prismaService.taskLabel.findMany({
      where: { projectId: data.projectId },
      select: {
        id: true,
        projectId: true,
        name: true,
        color: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  findByIdInProject(data: {
    labelId: string;
    projectId: string;
  }): Promise<ProjectTaskLabel | null> {
    return this.prismaService.taskLabel.findFirst({
      where: {
        id: data.labelId,
        projectId: data.projectId,
      },
      select: { id: true, projectId: true, name: true, color: true },
    });
  }

  updateLabel(data: { labelId: string; name?: string; color?: string }) {
    return this.prismaService.taskLabel.update({
      where: { id: data.labelId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.color !== undefined && { color: data.color }),
      },
      select: {
        id: true,
        projectId: true,
        name: true,
        color: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  deleteLabel(data: { labelId: string }) {
    return this.prismaService.taskLabel.delete({ where: { id: data.labelId } });
  }

  assignLabel(data: { taskId: string; labelId: string }) {
    return this.prismaService.taskLabelAssignment.create({
      data: {
        taskId: data.taskId,
        labelId: data.labelId,
      },
      select: { id: true, taskId: true, labelId: true },
    });
  }

  removeLabel(data: { taskId: string; labelId: string }) {
    return this.prismaService.taskLabelAssignment.delete({
      where: {
        taskId_labelId: {
          taskId: data.taskId,
          labelId: data.labelId,
        },
      },
    });
  }
}
