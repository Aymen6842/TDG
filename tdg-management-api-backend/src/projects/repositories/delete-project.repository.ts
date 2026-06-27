import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { Prisma, BusinessUnit } from '@prisma/client';

@Injectable()
export class DeleteProjectRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  /**
   * Delete a project with permission check
   * Uses delete with where clause that includes business unit filter
   */
  async deleteProjectWithPermission(data: {
    projectId: string;
    businessUnit: BusinessUnit | null;
  }): Promise<void> {
    // Build where clause with permission check
    const where: Prisma.ProjectWhereUniqueInput = {
      id: data.projectId,
    };

    // For business unit filtering, we need to use a different approach
    // since delete() doesn't support additional where conditions
    if (data.businessUnit) {
      // First verify the project exists and matches business unit
      const project = await this.prismaService.project.findFirstOrThrow({
        where: {
          id: data.projectId,
          businessUnit: data.businessUnit,
        },
        select: { id: true },
      });

      // Delete the project
      await this.prismaService.project.delete({
        where: { id: project.id },
      });
    } else {
      // No business unit filter, delete directly
      // This will throw P2025 if not found
      await this.prismaService.project.delete({
        where,
      });
    }
  }

  /**
   * Remove a member from a project
   */
  async removeMember(data: { memberId: string; projectId: string }) {
    // First verify the member belongs to this project
    const member = await this.prismaService.projectMember.findFirstOrThrow({
      where: { id: data.memberId, projectId: data.projectId },
      select: { id: true },
    });

    await this.prismaService.projectMember.delete({
      where: { id: member.id },
    });
  }
}
