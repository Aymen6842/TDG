import { PATCH } from "@/lib/http-methods";
import { AxiosError } from "axios";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";

interface Params {
  ids: string[];
}

/**
 * this functions is used to mark notifications as seen on server side
 * @param params ids is the notifications ids that will be marked as seen
 * @returns null if an error occured otherwise it returns true
 */
export default async function markNotificationAsSeenOnServerSide(params: Params) {
  const { access } = extractJWTokens();
  const headers = {
    Authorization: `Bearer ${access}`
  };
  const queryParams = [`notificationIds=${params.ids.join(",")}`];

  try {
    const endpoint = `/notifications?${queryParams.join("&")}`;

    const res = await PATCH(endpoint, headers, {});

    return true;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => markNotificationAsSeenOnServerSide(params));

      //unauthorized user error is already handled by the user hook
      if (!res) return null;

      return res;
    }

    return null;
  }
}
