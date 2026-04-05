import { format } from "date-fns";

export function dateToString(date: Date) {
  const formattedDate = date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  return formattedDate;
}

export function formatDateToBackendFormat(date: Date) {
  return date.toISOString();
}

export function formatDateToFrontendFormat(date: Date): string {
  return format(new Date(date), "yyyy-MM-dd HH:mm:ss");

}
