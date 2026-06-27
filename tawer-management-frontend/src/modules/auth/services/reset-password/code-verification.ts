import { POST } from "@/lib/http-methods";
import { AxiosError, AxiosHeaders } from "axios";

type AuthResponse = {
  status: number;
  ok: boolean;
  error?: string;
};

export async function verifyResetPasswordCode(data: {
  email: string;
  code: string;
}): Promise<AuthResponse> {
  const headers = {} as AxiosHeaders;

  try {
    await POST(`/auths/verify-reset-code`, headers, data);

    return { status: 200, ok: true };
  } catch (error) {
    const axiosError = error as AxiosError;
    const responseError: AuthResponse = {
      status: axiosError?.response?.status as number,
      error: "",
      ok: false
    };

    if (responseError.status == 400) responseError.error = "Invalid code!";
    else responseError.error = "An unexpected error occurred!";

    return responseError;
  }
}
