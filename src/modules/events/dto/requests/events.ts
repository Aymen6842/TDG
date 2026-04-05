import { formatDateToBackendFormat } from "@/utils/date";
import {
  CalendarEventRequestType,
  CalendarEventType,
  EventColor,
  EventColorOnBackendSide,
  EventType,
  EventTypeOnBackendSide
} from "../../types";
import { EventFormSchema } from "../../validations/event.schema";

export function castToCalendarEventRequestType(
  event: EventFormSchema,
  type: EventType
): CalendarEventRequestType {
  const uploadedEvent: CalendarEventRequestType = {
    content: [{ title: event.title }],
    startTime: formatDateToBackendFormat(new Date(event.startTime)),
    endTime: formatDateToBackendFormat(new Date(event.endTime)),
    type: castToEventRequestType(type)
  };

  if (event.allUsers !== undefined) uploadedEvent.toAllUsers = event.allUsers;
  if (event.participantsId !== undefined) uploadedEvent.participantsIds = event.participantsId;

  if (event.description !== undefined) uploadedEvent.content[0].description = event.description;
  if (event.color) uploadedEvent.color = castToEventColorRequestType(event.color);
  if (event.location !== undefined) uploadedEvent.location = event.location;

  return uploadedEvent;
}

export function castToFromCalendarEventTypeToCalendarEventRequestType(
  event: CalendarEventType,
  type: EventType
): CalendarEventRequestType {
  const uploadedEvent: CalendarEventRequestType = {
    content: [{ title: event.title }],
    startTime: formatDateToBackendFormat(new Date(event.startDate)),
    endTime: formatDateToBackendFormat(new Date(event.endDate || event.startDate)),
    type: castToEventRequestType(type)
  };

  if (event.description) uploadedEvent.content[0].description = event.description;
  if (event.color) uploadedEvent.color = castToEventColorRequestType(event.color);
  if (event.location) uploadedEvent.location = event.location;

  if (event.toAllUsers) uploadedEvent.toAllUsers = event.toAllUsers;
  if (event.participantsIds) uploadedEvent.participantsIds = event.participantsIds;

  return uploadedEvent;
}

export function castToEventRequestType(type: EventType): EventTypeOnBackendSide {
  switch (type) {
    case "meeting":
      return "Meeting";
    case "event":
      return "Event";
    case "personalEvent":
      return "PersonalEvent";
    default:
      return "PersonalEvent";
  }
}

export function castToEventColorRequestType(color: EventColor): EventColorOnBackendSide {
  switch (color) {
    case "sky":
      return "Sky";
    case "amber":
      return "Amber";
    case "violet":
      return "Violet";
    case "rose":
      return "Rose";
    case "emerald":
      return "Emerald";
    case "orange":
      return "Orange";
    default:
      return "Sky";
  }
}
