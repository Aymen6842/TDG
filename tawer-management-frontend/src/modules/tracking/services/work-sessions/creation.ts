
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { UsedDevice } from "../../types";
import { POST } from "@/lib/http-methods";
import { setItem } from "@/lib/localstorage";
import { ErrorDataResponse } from "@/types";
import { AxiosError } from "axios";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { CustomError } from "@/utils/custom-error";

interface Params {
  workMode: "ONSITE" | "REMOTE";
  device: UsedDevice;
}

export async function createWorkSessionOnServerSide(params: Params) {
  const { access } = extractJWTokens();
  const headers = {
    Authorization: `Bearer ${access}`
  };

  try {
    const response = await POST(`/work-days/sessions/start`, headers, {
      location: params.workMode,
      device: params.device
    });
    setItem("workerSessionId", response.data.id);
    return response.data.id;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorDataResponse>;

    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => createWorkSessionOnServerSide(params));

      if (!res) throw new CustomError("Unauthorized", 401);
      return res;
    } else
      throw new CustomError(
        axiosError.response?.data?.message || "",
        axiosError.response?.status || 500
      );
  }
}
