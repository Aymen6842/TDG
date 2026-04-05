export type WorkSessionStatus = "in" | "out";//viewer is used to view platform only then getting out

export interface WorkSessionInResponseType {
  id: string;
  isOpen: boolean;
  moodIsSubmitted?: boolean;
}

export interface WorkSessionType {
  id: string;
  status: WorkSessionStatus;
  moodIsSubmitted?: boolean;
}