"use client";

// Component exports
export { AgendaView } from "./views/agenda";
export { DayView } from "./views/day";
export { DraggableEvent } from "./draggable-event";
export { DroppableCell } from "./droppable-cell";
export { EventDialog } from "./event-dialog";
export { EventItem } from "./event-item";
export { EventsPopup } from "./events-popup";
export { EventCalendar } from "./event-calendar";
export { MonthView } from "./views/month";
export { WeekView } from "./views/week";
export { CalendarDndProvider, useCalendarDnd } from "./calendar-dnd-context";

// Constants and utility exports
export * from "../../utils/constants";
export * from "../../utils";

// Hook exports
export * from "@/modules/events/hooks/calendar/use-current-time-indicator";
export * from "@/modules/events/hooks/calendar/use-event-visibility";

// Type exports
export type { CalendarEventType, CalendarView, EventColor } from "../../types";
