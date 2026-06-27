import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { UpdateWorkDayByWorkerDto } from '../dto/request/update/update-work-day-by-worker.dto';
import { UpdateWorkDayByManagerDto } from '../dto/request/update/update-work-day-by-manager.dto';

@Injectable()
export class UpdateWorkDayRepository {
  constructor(private readonly prismaService: PrismaService) {}

  updateWorkDayByWorker(workDayId: string, data: UpdateWorkDayByWorkerDto) {
    return this.prismaService.workDay.update({
      where: {
        id: workDayId,
        userId: data.userId,
      },
      data: {
        dailyMood: data.dailyMood,
        workerNotes: data.workerNotes,
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

  updateWorkDayByManager(workDayId: string, data: UpdateWorkDayByManagerDto) {
    return this.prismaService.workDay.update({
      where: {
        id: workDayId,
      },
      data: {
        managerNotes: data.managerNotes,
        performanceRating: data.performanceRating,
      },
      select: {
        id: true,
        dailyMood: true,
        workerNotes: true,
        performanceRating: true,
        managerNotes: true,
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

  closeWorkSessionByWorkDayId(
    workSessionId: string,
    endTime: string,
    timeSpentInMinutes: number,
  ) {
    return this.prismaService.workSession.update({
      where: {
        id: workSessionId,
      },
      data: {
        endTime: endTime,
        timeSpentInMinutes: timeSpentInMinutes,
      },
    });
  }
}
