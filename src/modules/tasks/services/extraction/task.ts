import { GET } from "@/lib/http-methods";
import { AxiosError } from "axios";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { castToTaskDetailsType } from "../../utils/type-casting/tasks";
import { TaskDetailsInResponseType } from "../../types/tasks";
import { USE_MOCK } from "@/lib/mock-config";
import mockTasks from "../../../../../mock_data/personal-tasks.json";


interface Params {
  id: string;
}

export default async function retrieveTaskFromServerSide({ id }: Params) {
  if (USE_MOCK()) {
    const found = (mockTasks as TaskDetailsInResponseType[]).find(t => t.id === id);
    return found ? castToTaskDetailsType(found) : null;
  }

  const { access } = extractJWTokens();

  const headers = {
    Authorization: `Bearer ${access}`
  };

  try {
    const res = await GET(`/personal-tasks/${id}`, headers);

    return castToTaskDetailsType(res.data as TaskDetailsInResponseType);
  } catch (error) {
    const axiosError = error as AxiosError;

    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() =>
        retrieveTaskFromServerSide({ id })
      );

      if (!res) return null;
      return res;
    }

    return null;
  }
}
