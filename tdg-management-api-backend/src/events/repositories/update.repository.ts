import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { EventType, Language } from '@prisma/client';
import { UpdateEventDto } from '../dto/request/update/update-event.dto';

@Injectable()
export class UpdateEventRepository {
  constructor(private readonly prismaService: PrismaService) {}

  updateEvent(id: string, data: UpdateEventDto) {
    return this.prismaService.event.update({
      where: {
        id,
        OR: [
          {
            AND: [
              { type: EventType.PersonalEvent },
              { createdById: data.createdById },
            ],
          },
          {
            type: { not: EventType.PersonalEvent },
          },
        ],
      },
      data: {
        type: data.type,
        color: data.color,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        toAllUsers: data.toAllUsers,
        createdById: data.createdById,
        isNotified: data.isNotified,
        nextNotificationTime: data.nextNotificationTime,
        ...(data.participantsIds &&
          data.participantsIds.length > 0 && {
            participants: {
              deleteMany: {
                userId: { notIn: data?.participantsIds },
              },
              createMany: {
                data: data.participantsIds.map((userId) => ({
                  userId,
                })),
                skipDuplicates: true,
              },
            },
          }),
        content:
          data.content && data.content.length > 0
            ? {
                updateMany: data.content.map((content) => ({
                  where: {
                    language: Language.English,
                  },
                  data: {
                    title: content.title,
                    description: content.description,
                  },
                })),
              }
            : undefined,
      },

      select: {
        id: true,
        type: true,
        color: true,
        startTime: true,
        endTime: true,
        location: true,
        toAllUsers: true,
        isNotified: true,
        nextNotificationTime: true,
        createdAt: true,
        updatedAt: true,
        createdById: true,
        participants: true,
        content: {
          select: {
            title: true,
            description: true,
            language: true,
          },
        },
      },
    });
  }

  updateEventNotificationStatus(id: string) {
    return this.prismaService.event.update({
      where: { id },
      data: {
        isNotified: true,
      },
    });
  }
}
