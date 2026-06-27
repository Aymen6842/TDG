import { ActivityTrackingInResponseType, ActivityTrackingType } from "../../types";

export default function castToActivityTrackingType(
  activity: ActivityTrackingInResponseType
): ActivityTrackingType {
  return {
    id: activity.id,

    date: new Date(activity.date),

    sessions: activity.workSessions.map((session) => ({
      startTime: session.startTime ? new Date(session.startTime) : undefined,
      endTime: session.endTime ? new Date(session.endTime) : undefined,
      timeSpentInMinutes: Number(session.timeSpentInMinutes),
      device: session.device
    })),

    dailyMood: activity.dailyMood ? Number(activity.dailyMood) : undefined,
    workerNotes: activity.workerNotes ? activity.workerNotes : undefined,
    performanceRating: activity.performanceRating,
    managerNotes: activity.managerNotes,

    createdAt: new Date(activity.createdAt),
    updatedAt: new Date(activity.updatedAt)
  };
}
