export const getProjectProgress = (startTime: Date, endTime: Date) => {
  const now = new Date();
  const start = startTime.getTime();
  const end = endTime.getTime();
  const current = now.getTime();
  if (current < start) return 0;
  if (current > end) return 100;

  return Math.round(((current - start) / (end - start)) * 100);
};
