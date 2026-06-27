import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek
} from "date-fns";
import { AgendaDaysToShow } from "./constants";
import { CalendarView } from "../types";

export function getDisplayedDaysInCalendar(currentDate: Date, view: CalendarView) {
  let start: Date;
  let end: Date;

  switch (view) {
    case "month":
      // Get the first of the month, then go back to the start of that week
      const monthStart = startOfMonth(currentDate);
      start = startOfWeek(monthStart, { weekStartsOn: 0 });

      // Get the last of the month, then go forward to the end of that week
      const monthEnd = endOfMonth(currentDate);
      end = endOfWeek(monthEnd, { weekStartsOn: 0 });
      break;

    case "week":
      start = startOfWeek(currentDate, { weekStartsOn: 0 });
      end = endOfWeek(currentDate, { weekStartsOn: 0 });
      break;

    case "day":
      start = startOfDay(currentDate);
      end = endOfDay(currentDate);
      break;

    case "agenda":
      start = startOfDay(currentDate);
      // Uses your constant: AgendaDaysToShow (30 days)
      end = endOfDay(addDays(currentDate, AgendaDaysToShow - 1));
      break;

    default:
      start = currentDate;
      end = currentDate;
  }

  return {
    from: start,
    to: end
  };
}
