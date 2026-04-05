import { PATCH, POST } from "@/lib/http-methods";
import { AxiosError } from "axios";
import { CustomError } from "@/utils/custom-error";
import { ErrorDataResponse } from "@/types";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";

interface Params {
  user: FormData;
  id?: string;
}

export default async function uploadUserOnServerSide({ user, id = "" }: Params) {
  const { access } = extractJWTokens();
  const headers = {
    Authorization: `Bearer ${access}`
  };

  try {
    const response =
      id === ""
        ? await POST(`/users/register`, headers, user)
        : await PATCH(`/users/${id}`, headers, user);

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorDataResponse>;

    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => uploadUserOnServerSide({ user }));

      if (!res) throw new CustomError("Unauthorized", 401);
      return res;
    } else if (axiosError.response?.status === 400) {
      if (axiosError.response?.data.code === "P2000") {
        throw new CustomError("User already exist!", 400, "USER_ALREADY_EXIST");
      } else throw new CustomError("Invalid format!", 400);
    } else
      throw new CustomError(
        axiosError.response?.data?.message || "Failed to update user role",
        axiosError.response?.status || 500
      );
  }
}
