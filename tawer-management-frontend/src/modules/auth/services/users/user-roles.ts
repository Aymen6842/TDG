import { GET } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { AxiosError } from "axios";
import { castRoleFromBackendToFrontend } from "../../utils/user-roles";

/**
 * Retrieves the list of available user roles from the backend.
 * This service fetches the roles in backend format (UserRoleOnBackendSide).
 * The casting to frontend format should be done at the hook level if needed.
 */
export default async function retrieveUserRoles() {
  const { access } = extractJWTokens();
  const headers = {
    Authorization: `Bearer ${access}`
  };

  try {
    const endpoint = "/users/roles";
    const res = await GET(endpoint, headers);
    return res.data.map(castRoleFromBackendToFrontend);
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => retrieveUserRoles());
      if (!res) return [];
      return res;
    }
    return [];
  }
}
