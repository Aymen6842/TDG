import { PATCH, POST } from "@/lib/http-methods";
import { AxiosError } from "axios";
import { CustomError } from "@/utils/custom-error";
import { ErrorDataResponse } from "@/types";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { CalendarEventRequestType } from "../../types";

interface Params {
  event: CalendarEventRequestType;
  id?: string;
}

export default async function uploadEventToServerSide({ id = "", ...params }: Params) {
  const { access } = extractJWTokens();
  const headers = {
    Authorization: `Bearer ${access}`
  };

  try {
    const response =
      id === ""
        ? await POST(`/events`, headers, params.event)
        : await PATCH(`/events/${id}`, headers, params.event);

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorDataResponse>;

    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => uploadEventToServerSide({ id, ...params }));

      if (!res) throw new CustomError("Unauthorized", 401);
      return res;
    } else
      throw new CustomError(
        axiosError.response?.data?.message || "",
        axiosError.response?.status || 500
      );
  }
}
