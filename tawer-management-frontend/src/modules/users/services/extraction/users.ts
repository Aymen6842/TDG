import { GET } from "@/lib/http-methods";
import { AxiosError } from "axios";
import { UserInResponseType } from "../../types/users";
import { castToUserType } from "../../utils/data-management/type-casting/users";
import { PaginationType } from "@/types/pagination";
import { UsersCriteriaType } from "../../types/filtering";
import { UserRoleOnBackendSide } from "@/modules/auth/types";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";

interface Params {
  page: number;
  limit?: number;

  search?: string;
  searchBy?: string;

  roles?: UserRoleOnBackendSide[];

  usersCreatedAfter?: string;
  usersCreatedBefore?: string;

  sortBy?: UsersCriteriaType;
}

export default async function retrieveUsers(params: Params) {
  const { access } = extractJWTokens();
  const headers = {
    Authorization: `Bearer ${access}`
  };
  const queryParams = [`page=${params.page}`];

  if (params.limit) queryParams.push(`limit=${params.limit}`);
  if (
    params.searchBy &&
    params.search &&
    params.searchBy === "email" &&
    params.search.trim() !== ""
  )
    queryParams.push(`email=${encodeURIComponent(params.search)}`);
  if (params.searchBy && params.search && params.searchBy === "name" && params.search.trim() !== "")
    queryParams.push(`name=${encodeURIComponent(params.search)}`);
  if (
    params.searchBy &&
    params.search &&
    params.searchBy === "phone" &&
    params.search.trim() !== ""
  )
    queryParams.push(`phone=${encodeURIComponent(params.search)}`);
  if (params.roles && params.roles.length > 0) queryParams.push(`roles=${params.roles.join(",")}`);

  if (params.sortBy) queryParams.push(`sortBy=${params.sortBy}`);

  //users creation account period
  if (params.usersCreatedAfter && params.usersCreatedAfter !== "")
    queryParams.push(`userCreatedAtFrom=${params.usersCreatedAfter}`);
  if (params.usersCreatedBefore && params.usersCreatedBefore !== "")
    queryParams.push(`userCreatedAtTo=${params.usersCreatedBefore}`);

  try {
    const endpoint = `/users?${queryParams.join("&")}`;

    const res = await GET(endpoint, headers);

    return {
      data: (res.data.data as UserInResponseType[]).map((user) => castToUserType(user)),
      pagination: res.data.pagination as PaginationType
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => retrieveUsers(params));

      //unauthorized user error is already handled by the user hook
      if (!res) return null;

      return res;
    }

    return null;
  }
}
