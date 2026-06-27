import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

@Injectable()
export class DeleteEventRepository {
  constructor(private readonly prismaService: PrismaService) {}

  deleteEventById(eventId: string, createdById: string) {
    return this.prismaService.event.deleteMany({
      where: { id: eventId, createdById },
    });
  }
}
