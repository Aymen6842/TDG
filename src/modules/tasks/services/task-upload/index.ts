import { PATCH, POST } from "@/lib/http-methods";
import { AxiosError } from "axios";
import { CustomError } from "@/utils/custom-error";
import { ErrorDataResponse } from "@/types";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";

interface Params {
  task: FormData;
  id?: string;
}

/**
 * Create or update task on server side
 */
export default async function uploadTaskOnServerSide({
  task,
  id
}: Params) {
  const { access } = extractJWTokens();
  const headers = {
    Authorization: `Bearer ${access}`
  };

  try {
    const response =
      id
        ? await PATCH(`/personal-tasks/${id}`, headers, task)
        : await POST(`/personal-tasks/register`, headers, task)

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorDataResponse>;

    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => uploadTaskOnServerSide({ task }));

      if (!res) throw new CustomError("Unauthorized", 401);
      return res;
    } else if (axiosError.response?.status === 400) {
      if (axiosError.response?.data.code === "P2000") {
        throw new CustomError("Task already exist!", 400, "TASK_ALREADY_EXIST");
      } else throw new CustomError("Invalid format!", 400);
    } else
      throw new CustomError(
        axiosError.response?.data?.message || "Failed to create or update task ",
        axiosError.response?.status || 500
      );
  }
}
