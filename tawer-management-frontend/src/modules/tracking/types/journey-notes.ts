export interface JourneyNotesRequestType {
  workerNotes?: string;
  dailyMood?: number;
}

export interface WorkerRatingRequestType {
  managerNotes?: string;
  performanceRating?: number;
}

export interface JournreyNotesStoreType {
  date: string;
  mood: number;
  note: string;
}
