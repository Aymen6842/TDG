export function isAllDayEvent(start: Date | string, end: Date | string): boolean {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const isStartAtMidnight =
    startDate.getHours() === 0 && startDate.getMinutes() === 0 && startDate.getSeconds() === 0;

  const isEndAtMidnight =
    endDate.getHours() === 0 && endDate.getMinutes() === 0 && endDate.getSeconds() === 0;

  if (isStartAtMidnight && isEndAtMidnight) {
    return true;
  }

  return false;
}
