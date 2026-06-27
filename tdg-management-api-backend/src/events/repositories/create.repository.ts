import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { CreateEventDto } from '../dto/request/post/create-event.dto';
import { Language } from '@prisma/client';

@Injectable()
export class CreateEventRepository {
  constructor(private readonly prismaService: PrismaService) {}

  createEvent(data: CreateEventDto) {
    return this.prismaService.event.create({
      data: {
        type: data.type,
        color: data.color,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        toAllUsers: data.toAllUsers,
        createdById: data.createdById,
        nextNotificationTime: data.nextNotificationTime,
        participants: data.participantsIds?.length
          ? {
              create: data.participantsIds.map((userId) => ({
                userId,
              })),
            }
          : undefined,
        content: {
          create: data.content.map((content) => ({
            title: content.title,
            description: content.description,
            language: Language.English,
          })),
        },
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
}
