import { PATCH } from "@/lib/http-methods";
import { AxiosError } from "axios";
import { refreshToken } from "./refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { CustomError } from "@/utils/custom-error";

type AuthResponse = {
  status: number;
  ok: boolean;
  error?: string;
  code?: string;
};

export async function changePassword(data: {
  oldPassword: string;
  newPassword: string;
}): Promise<AuthResponse> {
  const { access } = extractJWTokens();
  const headers = {
    Authorization: `Bearer ${access}`
  };

  try {
    await PATCH(`/users/password/me`, headers, data);

    return { status: 200, ok: true };
  } catch (error) {
    const axiosError = error as AxiosError<{ code: string; message: string }>;
    const errorData = axiosError?.response?.data as {
      code: string;
      message: string;
    };

    //unauthorzied user
    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => changePassword(data));
      return res;
    }
    //invalid password
    else if (axiosError.response?.status === 400 && axiosError.response?.data.code === "P4000") {
      throw new CustomError(
        "invalidPassword",
        axiosError.response?.status,
        axiosError.response?.data.code
      );
    } else if (axiosError.response?.status === 400 && axiosError.response?.data.code === "P1000") {
      throw new CustomError(
        "invalidData",
        axiosError.response?.status,
        axiosError.response?.data.code
      );
    } else if (axiosError.response?.status === 404 && axiosError.response?.data.code === "P2001") {
      throw new CustomError(
        "userNotFound",
        axiosError.response?.status,
        axiosError.response?.data.code
      );
    } else if (axiosError.response?.status === 500 && axiosError.response?.data.code === "P1001") {
      throw new CustomError(
        "serverError",
        axiosError.response?.status,
        axiosError.response?.data.code
      );
    }
    const responseError: AuthResponse = {
      status: axiosError?.response?.status as number,
      error: errorData.message,
      code: errorData.code,
      ok: false
    };

    return responseError;
  }
}
