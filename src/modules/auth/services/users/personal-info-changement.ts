import { PATCH } from "@/lib/http-methods";
import { AxiosError } from "axios";
import { CustomError } from "@/utils/custom-error";
import { ErrorDataResponse } from "@/types";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";

interface Params {
  user: FormData;
}

export default async function updatePersonalInfoOnServerSide({ user }: Params) {
  const { access } = extractJWTokens();
  const headers = {
    Authorization: `Bearer ${access}`
  };

  try {
    const response = await PATCH(`/users/me`, headers, user);

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorDataResponse>;

    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => updatePersonalInfoOnServerSide({ user }));

      if (!res) throw new CustomError("Unauthorized", 401);
      return res;
    } else
      throw new CustomError(
        axiosError.response?.data?.message || "Failed to update user role",
        axiosError.response?.status || 500
      );
  }
}
