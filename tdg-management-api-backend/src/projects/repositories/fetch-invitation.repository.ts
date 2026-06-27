import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { InvitationStatus } from '@prisma/client';

@Injectable()
export class FetchInvitationRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  getInvitationByToken(data: { token: string }) {
    return this.prismaService.projectInvitation.findUnique({
      where: {
        token: data.token,
      },
    });
  }

  updateInvitationStatus(data: {
    id: string;
    status: InvitationStatus;
    acceptedAt?: Date;
    invitedUserId?: string;
  }) {
    return this.prismaService.projectInvitation.update({
      where: { id: data.id },
      data: {
        status: data.status,
        ...(data.acceptedAt && { acceptedAt: data.acceptedAt }),
        ...(data.invitedUserId && { invitedUserId: data.invitedUserId }),
      },
    });
  }

  getInvitationById(data: { id: string }) {
    return this.prismaService.projectInvitation.findUnique({
      where: { id: data.id },
    });
  }

  updateInvitation(data: { id: string; token: string; expiresAt: Date }) {
    return this.prismaService.projectInvitation.update({
      where: { id: data.id },
      data: {
        token: data.token,
        expiresAt: data.expiresAt,
      },
    });
  }
}
