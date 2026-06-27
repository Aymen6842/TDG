import { PATCH } from "@/lib/http-methods";
import { AxiosError } from "axios";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { WorkerRatingRequestType } from "../types/journey-notes";
import { ErrorDataResponse } from "@/types";
import { CustomError } from "@/utils/custom-error";

interface Params {
  workerRating: WorkerRatingRequestType;
  workDayId: string;
}

/**
 *
 */
export default async function uploadWorkerRatingToServerSide(params: Params) {
  const { access } = extractJWTokens();
  const headers = {
    Authorization: `Bearer ${access}`
  };

  try {
    const res = await PATCH(`/work-days/${params.workDayId}/manager`, headers, params.workerRating);

    return true;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorDataResponse>;

    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => uploadWorkerRatingToServerSide(params));

      if (!res) throw new CustomError("Unauthorized", 401);
      return res;
    } else
      throw new CustomError(
        axiosError.response?.data?.message || "Failed to upload",
        axiosError.response?.status || 500
      );
  }
}
