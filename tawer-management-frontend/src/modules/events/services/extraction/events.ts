import { GET } from "@/lib/http-methods";
import { AxiosError } from "axios";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { CalendarEventInResponseType, EventType } from "../../types";
import { castToCalendarEventType } from "../../dto/responses/events";
import { castToEventRequestType } from "../../dto/requests/events";

interface Params {
  type: EventType;
  from?: string;
  to?: string;
}

export default async function retreiveEventsFromServerSide(params: Params) {
  const { access } = extractJWTokens();
  const headers = {
    Authorization: `Bearer ${access}`
  };
  const queryParams = [`eventType=${castToEventRequestType(params.type)}`];

  if (params.from && params.from !== "") queryParams.push(`from=${params.from}`);
  if (params.to && params.to !== "") queryParams.push(`to=${params.to}`);
  if (params.type)
    try {
      const endpoint = `/events?${queryParams.join("&")}`;

      const res = await GET(endpoint, headers);

      return (res.data.events as CalendarEventInResponseType[]).map((event) =>
        castToCalendarEventType(event)
      );
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        const res = await refreshToken(() => retreiveEventsFromServerSide(params));

        //unauthorized user error is already handled by the user hook
        if (!res) return null;

        return res;
      }

      return null;
    }
}
