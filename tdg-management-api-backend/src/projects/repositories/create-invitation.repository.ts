import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { InvitationStatus } from '@prisma/client';

@Injectable()
export class CreateInvitationRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  createInvitation(data: {
    email: string;
    projectId: string;
    invitedById: string;
    token: string;
    expiresAt: Date;
    isManager?: boolean;
  }) {
    return this.prismaService.projectInvitation.upsert({
      where: {
        projectId_email: {
          projectId: data.projectId,
          email: data.email,
        },
      },
      create: {
        email: data.email,
        projectId: data.projectId,
        invitedById: data.invitedById,
        token: data.token,
        expiresAt: data.expiresAt,
        status: InvitationStatus.PENDING,
        isManager: data.isManager ?? false,
      },
      update: {
        invitedById: data.invitedById,
        token: data.token,
        expiresAt: data.expiresAt,
        status: InvitationStatus.PENDING,
        isManager: data.isManager ?? false,
        acceptedAt: null,
        invitedUserId: null,
      },
    });
  }

  findExistingInvitation(data: { email: string; projectId: string }) {
    return this.prismaService.projectInvitation.findFirst({
      where: {
        email: data.email,
        projectId: data.projectId,
        status: InvitationStatus.PENDING,
      },
    });
  }

  async findExistingMember(data: { email: string; projectId: string }) {
    const user = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return null;
    }

    return this.prismaService.projectMember.findFirst({
      where: {
        userId: user.id,
        projectId: data.projectId,
      },
    });
  }
}
