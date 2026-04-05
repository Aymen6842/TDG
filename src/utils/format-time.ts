/**
 * this function put time spent in minutes into hours
 */
export function formatTimeSpentFromMinutesToHours(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    if (remainingMins === 0) return `${hours}h`;
    return `${hours.toFixed(0)}h ${remainingMins.toFixed(0)}m`;
  }
  return `${minutes.toFixed(0)}m`;
}
