// Project task status — badge and dot colors
export const projectTaskStatusClasses: Record<string, string> = {
  BACKLOG:     "bg-chart-4/10 text-chart-4 border-chart-4/20",
  TODO:        "bg-chart-2/10 text-chart-2 border-chart-2/20",
  IN_PROGRESS: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  TESTING:     "bg-chart-4/20 text-chart-4 border-chart-4/30",
  IN_REVIEW:   "bg-chart-3/10 text-chart-3 border-chart-3/20",
  DONE:        "bg-chart-5/10 text-chart-5 border-chart-5/20"
};

export const projectTaskStatusDotColors: Record<string, string> = {
  BACKLOG:     "bg-chart-4/50",
  TODO:        "bg-chart-2",
  IN_PROGRESS: "bg-chart-1",
  TESTING:     "bg-chart-4",
  IN_REVIEW:   "bg-chart-3",
  DONE:        "bg-chart-5"
};

// Project task priority — badge and dot colors
export const projectTaskPriorityClasses: Record<string, string> = {
  URGENT: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  HIGH:   "bg-chart-3/10 text-chart-3 border-chart-3/20",
  MEDIUM: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  LOW:    "bg-chart-4/10 text-chart-4 border-chart-4/20"
};

export const projectTaskPriorityDotColors: Record<string, string> = {
  URGENT: "bg-chart-3",
  HIGH:   "bg-chart-3/70",
  MEDIUM: "bg-chart-1",
  LOW:    "bg-chart-4/50"
};

// Project task type — badge and dot colors
export const projectTaskTypeClasses: Record<string, string> = {
  STORY: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  TASK:  "bg-chart-2/10 text-chart-2 border-chart-2/20",
  BUG:   "bg-chart-3/10 text-chart-3 border-chart-3/20",
  SPIKE: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  EPIC:  "bg-chart-1/10 text-chart-1 border-chart-1/20"
};

export const projectTaskTypeDotColors: Record<string, string> = {
  STORY: "bg-chart-5",
  TASK:  "bg-chart-2",
  BUG:   "bg-chart-3",
  SPIKE: "bg-chart-4",
  EPIC:  "bg-chart-1"
};

// Epic badge
export const epicBadgeClasses = "border-chart-1/30 bg-chart-1/10 text-chart-1";
