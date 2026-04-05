import { GET } from "@/lib/http-methods";
import { AxiosError } from "axios";

import { TaskSort, TaskStatus, TaskPriority } from "../../types/filtering";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { TaskInResponseType } from "../../types/tasks";
import { castToTaskType } from "../../utils/type-casting/task";
import { USE_MOCK } from "@/lib/mock-config";
import mockTasks from "../../../../../mock_data/personal-tasks.json";

interface Params {
  archived?: boolean;
  status?: TaskStatus;
  priority?: TaskPriority;
  sortBy?: TaskSort;
  search?: string;
}

export default async function retrieveTasks(params: Params) {
  if (USE_MOCK) return (mockTasks as TaskInResponseType[]).map(castToTaskType);

  const { access } = extractJWTokens();
  const headers = {
    Authorization: `Bearer ${access}`
  };
  const queryParams = [];

  if (params.sortBy) queryParams.push(`sortBy=${params.sortBy}`);
  if (params.status) queryParams.push(`statuses=${params.status}`);
  if (params.priority) queryParams.push(`priorities=${params.priority}`);
  if (params.archived) queryParams.push(`archived=${params.archived}`);
  if (params.search) queryParams.push(`search=${encodeURIComponent(params.search)}`);

  try {
    const endpoint = `/personal-tasks?${queryParams.join("&")}`;

    const res = await GET(endpoint, headers);

    return (res.data as TaskInResponseType[]).map((task) => castToTaskType(task));

  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => retrieveTasks(params));

      if (!res) return null;

      return res;
    }

    return null;
  }
}
