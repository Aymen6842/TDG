import { PATCH, POST } from "@/lib/http-methods";
import { AxiosError } from "axios";
import { CustomError } from "@/utils/custom-error";
import { ErrorDataResponse } from "@/types";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { UploadedTeamType } from "../../types/teams";

interface Params {
  team: UploadedTeamType;
  id?: string;
}

export default async function uploadTeamOnServerSide({ team, id = "" }: Params) {
  const { access } = extractJWTokens();
  const headers = {
    Authorization: `Bearer ${access}`
  };

  try {
    const response =
      id === ""
        ? await POST(`/teams/register`, headers, team)
        : await PATCH(`/teams/${id}`, headers, team);

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorDataResponse>;

    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => uploadTeamOnServerSide({ team }));

      if (!res) throw new CustomError("Unauthorized", 401);
      return res;
    } else if (axiosError.response?.status === 400) {
      if (axiosError.response?.data.code === "P2000") {
        throw new CustomError("Team already exist!", 400, "TEAM_ALREADY_EXIST");
      } else throw new CustomError("Invalid format!", 400);
    } else
      throw new CustomError(
        axiosError.response?.data?.message || "Failed to upload",
        axiosError.response?.status || 500
      );
  }
}
