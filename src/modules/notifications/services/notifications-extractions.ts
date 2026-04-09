import { GET } from "@/lib/http-methods";
import { AxiosError } from "axios";
import { PaginationType } from "@/types/pagination";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { NotificationInResponseType } from "@/modules/notifications/types";
import { castToNotificationType } from "@/modules/notifications/utils/type-casting/notifications";
import { USE_MOCK } from "@/lib/mock-config"; // REMOVE THIS LINE FOR PROD

interface Params {
  page: number;
  limit?: number;
  status?: "seen" | "unseen";
}

export default async function retreiveNotifications(params: Params) {
  if (USE_MOCK()) return null; // REMOVE THIS LINE FOR PROD

  const { access } = extractJWTokens();
  const headers = {
    Authorization: `Bearer ${access}`
  };
  const queryParams = [`page=${params.page}`];

  if (params.limit) queryParams.push(`limit=${params.limit}`);
  if (params.status) queryParams.push(`isSeen=${params.status === "seen"}`);

  try {
    const endpoint = `/notifications/received?${queryParams.join("&")}`;

    const res = await GET(endpoint, headers);

    return {
      data: (res.data.data as NotificationInResponseType[]).map((notification) =>
        castToNotificationType(notification)
      ),
      pagination: res.data.pagination as PaginationType
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => retreiveNotifications(params));

      //unauthorized user error is already handled by the user hook
      if (!res) return null;

      return res;
    }

    return null;
  }
}
