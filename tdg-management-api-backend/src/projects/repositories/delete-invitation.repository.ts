import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { InvitationStatus } from '@prisma/client';

@Injectable()
export class DeleteInvitationRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  deleteInvitation(data: { id: string }) {
    return this.prismaService.projectInvitation.update({
      where: {
        id: data.id,
      },
      data: {
        status: InvitationStatus.CANCELLED,
      },
    });
  }
}
