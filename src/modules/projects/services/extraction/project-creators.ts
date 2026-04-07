import { GET } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { UserInResponseType } from "@/modules/users/types/users";

export interface ProjectCreator {
  id: string;
  name: string;
}

// Fetches all users with CEO, CTO, or CMO roles — these are the only ones who can create projects
export default async function retrieveProjectCreators(): Promise<ProjectCreator[]> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await GET(`/users?roles=CEO,CTO,CMO&limit=100&page=1`, headers);
    return (res.data.data as UserInResponseType[]).map(u => ({ id: u.id, name: u.name }));
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => retrieveProjectCreators()) ?? [];
    }
    return [];
  }
}
