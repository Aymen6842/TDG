import { POST } from "@/lib/http-methods";
import { AxiosError, AxiosHeaders, AxiosResponse } from "axios";
import { UserSignInType } from "../types";
import { CustomError } from "@/utils/custom-error";

type AuthResponse = {
  status: number;
  ok: boolean;
  errors?: string;
};

export async function signIn(data: UserSignInType): Promise<AuthResponse> {
  const headers = {} as AxiosHeaders;

  try {
    const res: AxiosResponse = await POST(`/auths/login`, headers, data);
    const tokens = res.data as { access: string; refresh: string };

    localStorage.setItem("access", tokens.access);
    localStorage.setItem("refresh", tokens.refresh);

    return { status: 204, ok: true };
  } catch (error) {
    const axiosError = error as AxiosError<{ code: string; message: string }>;

    throw new CustomError(axiosError.message, axiosError?.response?.status || 500, axiosError.code);
  }
}
