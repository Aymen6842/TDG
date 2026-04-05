import { POST } from "@/lib/http-methods";
import { AxiosError, AxiosHeaders } from "axios";

type AuthResponse = {
  status: number;
  ok: boolean;
  error?: string;
};

export async function resetPassword(data: {
  email: string;
  code: string;
  password: string;
}): Promise<AuthResponse> {
  const headers = {} as AxiosHeaders;

  try {
    await POST(`/auths/reset-password`, headers, data);

    return { status: 200, ok: true };
  } catch (error) {
    const axiosError = error as AxiosError;
    const responseError: AuthResponse = {
      status: axiosError?.response?.status as number,
      error: "",
      ok: false
    };

    return responseError;
  }
}
