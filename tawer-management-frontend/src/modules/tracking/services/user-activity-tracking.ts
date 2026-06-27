import { GET } from "@/lib/http-methods";
import { AxiosError } from "axios";
import { PaginationType } from "@/types/pagination";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import castToActivityTrackingType from "../dto/responses/activity-tracking";
import { ActivityTrackingInResponseType } from "../types";

interface Params {
  page: number;
  limit?: number;

  from?: string;
  to?: string;

  userId: string;
  isManager?: boolean;
}

export default async function retreiveUserActivity({ isManager = true, ...params }: Params) {
  const { access } = extractJWTokens();
  const headers = {
    Authorization: `Bearer ${access}`
  };
  const queryParams = [`page=${params.page}`];

  if (params.limit) queryParams.push(`limit=${params.limit}`);
  if (params.from && params.from !== "") queryParams.push(`startTime=${params.from}`);
  if (params.to && params.to !== "") queryParams.push(`endTime=${params.to}`);
  queryParams.push(`usersIds=${params.userId}`);

  try {
    const endpoint = isManager
      ? `/work-days/manager?${queryParams.join("&")}`
      : `/work-days?${queryParams.join("&")}`;

    const res = await GET(endpoint, headers);

    return {
      data: (res.data.data as ActivityTrackingInResponseType[]).map((activity) =>
        castToActivityTrackingType(activity)
      ),
      pagination: res.data.pagination as PaginationType
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => retreiveUserActivity({ isManager, ...params }));

      //unauthorized user error is already handled by the user hook
      if (!res) return null;

      return res;
    }

    return null;
  }
}
