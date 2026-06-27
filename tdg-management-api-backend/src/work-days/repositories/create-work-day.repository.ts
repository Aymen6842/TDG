import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { CreateWorkDayDto } from '../dto/request/post/create-work-day.dto';
import { WorkSessionDevice, WorkSessionLocation } from '@prisma/client';

@Injectable()
export class CreateWorkDayRepository {
  constructor(private readonly prismaService: PrismaService) {}

  createWorkDay(data: CreateWorkDayDto) {
    return this.prismaService.workDay.create({
      data: {
        userId: data.userId,
      },
      select: {
        id: true,
        dailyMood: true,
        workerNotes: true,
        workSessions: {
          select: {
            startTime: true,
            endTime: true,
            timeSpentInMinutes: true,
            location: true,
            device: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  createWorkSessionForWorkDay(
    workDayId: string,
    startTime: string,
    location: WorkSessionLocation,
    device: WorkSessionDevice,
  ) {
    return this.prismaService.workSession.create({
      data: {
        workDayId: workDayId,
        startTime: startTime,
        location: location,
        device: device,
      },
      select: {
        startTime: true,
        endTime: true,
        timeSpentInMinutes: true,
        location: true,
        device: true,
      },
    });
  }
}
