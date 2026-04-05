import { GET } from "@/lib/http-methods";
import { AxiosError } from "axios";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { WorkedDayTrackingInResponseType } from "../types";
import castToWorkedDayTrackingType from "../dto/responses/worked-days-tracking";

interface Params {
  from?: string;
  to?: string;

  userId: string;
  isManager?: boolean;
}

export default async function retreiveWorkedDays({ isManager = true, ...params }: Params) {
  const { access } = extractJWTokens();
  const headers = {
    Authorization: `Bearer ${access}`
  };
  const queryParams = [];

  if (params.from && params.from !== "") queryParams.push(`startTime=${params.from}`);
  if (params.to && params.to !== "") queryParams.push(`endTime=${params.to}`);
  queryParams.push(`usersIds=${params.userId}`);

  try {
    const endpoint = isManager
      ? `/work-days/statistics/details/manager?${queryParams.join("&")}`
      : `/work-days/statistics/details?${queryParams.join("&")}`;

    const res = await GET(endpoint, headers);

    return (res.data as WorkedDayTrackingInResponseType[]).map((workedDay) =>
      castToWorkedDayTrackingType(workedDay)
    )
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => retreiveWorkedDays({ isManager, ...params }));

      //unauthorized user error is already handled by the user hook
      if (!res) return null;

      return res;
    }

    return null;
  }
}
