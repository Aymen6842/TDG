import { PUT } from "@/lib/http-methods";
import { AxiosError } from "axios";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { useNotificationsTokensStore } from "../../store/notifications-tokens";

interface Params {
  data: {
    token: string;
    //exp iphone 13
    device: string;
    //exp Android
    deviceType: string;
  }
}

/**
 * this functions is used to set up user FCM
 * @param params ids is the notifications ids that will be marked as seen
 * @returns null if an error occured otherwise it returns true
 */
export default async function sendUserNotificationsToken(params: Params) {
  const { access } = extractJWTokens();
  const headers = {
    Authorization: `Bearer ${access}`
  };

  try {
    const endpoint = `/notifications/token`;

    const res = await PUT(endpoint, headers, params.data);

    useNotificationsTokensStore.getState().setFcmToken(params.data.token);

    return true;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => sendUserNotificationsToken(params));

      //unauthorized user error is already handled by the user hook
      if (!res) return null;

      return res;
    }

    return null;
  }
}
