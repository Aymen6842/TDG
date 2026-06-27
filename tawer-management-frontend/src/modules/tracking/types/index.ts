export type UsedDevice = "MOBILE" | "DESKTOP" | "TABLET" | "OTHER";

export interface ActivityTrackingType {
  id: string;

  date: Date;

  sessions: {
    startTime?: Date;
    endTime?: Date;
    timeSpentInMinutes: number;
    device: UsedDevice;
  }[];

  dailyMood?: number;
  workerNotes?: string;
  performanceRating?: number;
  managerNotes?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityTrackingInResponseType {
  id: string;

  date: string;

  workSessions: {
    startTime: string | null;
    endTime: string | null;
    timeSpentInMinutes: number;
    device: UsedDevice;
  }[];

  dailyMood?: number;
  workerNotes?: string;
  performanceRating?: number;
  managerNotes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface WorkedDayTrackingInResponseType {
  date: string;
  remoteWorkedHours: number;
  officeWorkedHours: number;
}

export interface WorkedDayTrackingType {
  day: string;
  remoteHours: number;
  officeHours: number;
  totalHours: number;
  workMode: "Mixed" | "Remote" | "Office" | "None"
}