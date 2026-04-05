import { DELETE } from "@/lib/http-methods";
import { AxiosError } from "axios";
import { CustomError } from "@/utils/custom-error";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { ErrorDataResponse } from "@/types";

type Response = {
  status: number;
  ok: boolean;
  error: string;
};

export async function deleteElementOnServerSide(
  type: "user" | "team" | "task" | "subTask" | "comment" | "attachment" | "server" | "service",
  elementId: string
): Promise<Response> {
  const { access } = extractJWTokens();
  const headers = {
    Authorization: `Bearer ${access}`
  };

  try {
    const elementTypeOnServerSide = type === "user" ? "users" : type === "task" || type === "subTask"
      ? "personal-tasks" : type === "comment" ? "personal-tasks/comments" : type === "attachment" ? "personal-tasks/attachments" : type === "team" ? "teams" : type === "server" ? "servers" : "servers/services"
    const endpoint = `/${elementTypeOnServerSide}/${elementId}`;


    await DELETE(endpoint, headers);

    return { ok: true, status: 200, error: "" };
  } catch (error) {
    const axiosError = error as AxiosError<ErrorDataResponse>;

    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => deleteElementOnServerSide(type, elementId));

      //unauthorized user error is already handled by the user hook
      if (!res) throw new CustomError("Unauthorized!", 401);

      return res;
    }

    throw new CustomError(
      axiosError.response?.data?.message || "Server Error",
      axiosError.response?.status || 500
    );
  }
}
