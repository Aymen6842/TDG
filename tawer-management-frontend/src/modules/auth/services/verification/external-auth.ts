import { POST } from "@/lib/http-methods";
import { AxiosError, AxiosHeaders } from "axios";

type AuthResponse = {
  status: number;
  ok: boolean;
  data?: { rt: string; at: string };
};

export async function verifyExternalAuthCode(
  code: string,
  externalAuth: "facebook" | "google"
): Promise<AuthResponse> {
  const headers = {} as AxiosHeaders;

  try {
    const res = await POST(`/auths/${externalAuth}`, headers, { code });

    const tokens = res.data as { access: string; refresh: string };

    return {
      status: 200,
      ok: true,
      data: { rt: tokens.refresh, at: tokens.access }
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    const responseError: AuthResponse = {
      status: axiosError?.response?.status ? (axiosError?.response?.status as number) : 500,
      ok: false
    };

    return responseError;
  }
}
