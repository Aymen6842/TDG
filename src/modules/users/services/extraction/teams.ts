import { GET } from "@/lib/http-methods";
import { AxiosError } from "axios";
import { PaginationType } from "@/types/pagination";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { TeamInResponseType } from "../../types/teams";
import { castToTeamType } from "../../utils/data-management/type-casting/teams";

interface Params {
  page: number;
  limit?: number;
  search?: string;
}

export default async function retreiveTeamsFromServerSide(params: Params) {
  const { access } = extractJWTokens();
  const headers = {
    Authorization: `Bearer ${access}`
  };
  const queryParams = [`page=${params.page}`];

  if (params.limit) queryParams.push(`limit=${params.limit}`);
  if (params.search && params.search.trim() !== "") queryParams.push(`search=${params.search}`);

  try {
    const endpoint = `/teams?${queryParams.join("&")}`;

    const res = await GET(endpoint, headers);

    return {
      data: (res.data.data as TeamInResponseType[]).map((team) => castToTeamType(team)),
      pagination: res.data.pagination as PaginationType
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => retreiveTeamsFromServerSide(params));

      //unauthorized team error is already handled by the team hook
      if (!res) return null;

      return res;
    }

    return null;
  }
}
