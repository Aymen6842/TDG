import {
  CalendarEventInResponseType,
  CalendarEventType,
  EventColor,
  EventColorOnBackendSide,
  EventType,
  EventTypeOnBackendSide
} from "../../types";

export function castToCalendarEventType(event: CalendarEventInResponseType): CalendarEventType {
  return {
    id: event.id,
    title: event.title,
    description: event.description,

    location: event.location,
    color: castToEventColorType(event.color || "Sky"),

    startDate: new Date(event.startTime),
    endDate: new Date(event.endTime || event.startTime),

    toAllUsers: event.toAllUsers,
    createdById: event.createdById,
  };
}

export function castToEventColorType(color: EventColorOnBackendSide): EventColor {
  switch (color) {
    case "Sky":
      return "sky";
    case "Amber":
      return "amber";
    case "Violet":
      return "violet";
    case "Rose":
      return "rose";
    case "Emerald":
      return "emerald";
    case "Orange":
      return "orange";
    default:
      return "sky";
  }
}

export function castToEventType(type: EventTypeOnBackendSide): EventType {
  switch (type) {
    case "Meeting":
      return "meeting";
    case "Event":
      return "event";
    case "PersonalEvent":
      return "personalEvent";
    default:
      return "personalEvent";
  }
}
