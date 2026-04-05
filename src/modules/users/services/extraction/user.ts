import { GET } from "@/lib/http-methods";
import { AxiosError } from "axios";
import { castToUserType } from "../../utils/data-management/type-casting/users";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { CustomError } from "@/utils/custom-error";

interface Params {
  id: string;
}

export default async function retreiveUserInfo(params: Params) {
  const { access } = extractJWTokens();
  const headers = {
    Authorization: `Bearer ${access}`
  };

  const queryParams: string[] = [`usersIds=${params.id}`];

  try {
    const endpoint = `/users?${queryParams.join(",")}`;

    const res = await GET(endpoint, headers);

    if (res.data.data[0]) return castToUserType(res.data.data[0]);
    else throw new CustomError("Not found!", 404);
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => retreiveUserInfo(params));

      //unauthorized user error is already handled by the user hook
      if (!res) return null;

      return res;
    }

    return null;
  }
}
