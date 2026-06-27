import { useQuery } from "@tanstack/react-query";
import useUser from "@/modules/auth/hooks/users/use-user";
import { CalendarEventType, EventType } from "../../types";
import retreiveEventsFromServerSide from "../../services/extraction/events";
import { formatDateToBackendFormat } from "@/utils/date";

interface Params {
  type: EventType;
  from?: Date;
  to?: Date;
}

export default function useEvents({ type, from, to }: Params) {
  const { user } = useUser();

  const { data, isLoading, isError } = useQuery<CalendarEventType[]>({
    queryKey: ["events", type, from, to],
    queryFn: () =>
      retreiveEventsFromServerSide({
        type,
        from: from ? formatDateToBackendFormat(from) : undefined,
        to: to ? formatDateToBackendFormat(to) : undefined
      }),
    enabled: user !== null
  });

  return {
    events: data || [],
    eventsAreLoading: isLoading || data === undefined,
    eventsError: false //isError || data === null,
  };
}
