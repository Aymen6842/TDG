"use client";;
import { EventCalendar, CalendarEventType } from ".";
import useEvents from "../../hooks/extraction/use-events";
import { EventType } from "../../types";
import useEventsActions from "../../hooks/event-actions";
import EventWrapper from "./event-wrapper";
import { useState } from "react";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";

interface Props {
  type: EventType;
}

export default function EventCalendarApp({ type }: Props) {
  const [calendarDisplayedDays, setCalendarDisplayedDays] = useState<{ from?: Date; to?: Date }>(
    {}
  );

  const { user, isLoading: userIsLoading } = useCurrentUser();
  const { events, eventsAreLoading } = useEvents({
    type,
    from: calendarDisplayedDays.from,
    to: calendarDisplayedDays.to
  });
  const { handleEventDelete, isPending, handleEventUpdate } = useEventsActions({
    type
  });
  const userHasViewPermissions = type === "personalEvent" ? true : user ? hasPermissions(user.roles, type === "event" ? "eventsManagement" : "meetingsManagement", "view") : false;

  return (
    events && (
      <EventWrapper type={type}>
        <EventCalendar
          events={userHasViewPermissions ? events as CalendarEventType[] : []}
          isLoading={eventsAreLoading || userIsLoading}
          onEventDelete={handleEventDelete}
          onEventUpdate={handleEventUpdate}
          setDisplayedDateRanges={setCalendarDisplayedDays}
        />
      </EventWrapper>
    )
  );
}
