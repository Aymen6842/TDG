import { POST } from "@/lib/http-methods";
import { AxiosError, AxiosHeaders } from "axios";

type AuthResponse = {
  status: number;
  ok: boolean;
  error?: string;
};

export async function sendResetPasswordEmail(email: string): Promise<AuthResponse> {
  const headers = {} as AxiosHeaders;

  try {
    await POST(`/auths/request-reset-code`, headers, { email: email });

    return { status: 200, ok: true };
  } catch (error) {
    const axiosError = error as AxiosError;
    const responseStatus = axiosError.response?.status
      ? (axiosError.response.status as number)
      : 500;
    const responseError: AuthResponse = {
      status: responseStatus,
      ok: false,
      error: ""
    };

    return responseError;
  }
}
