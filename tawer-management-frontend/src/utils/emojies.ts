export function getMoodEmoji(mood: number): string {
  if (mood <= 0) return "😢";
  if (mood == 1) return "😔";
  if (mood == 2) return "😐";
  if (mood == 3) return "🙂";
  if (mood == 4) return "😊";

  return "🤩";
}
