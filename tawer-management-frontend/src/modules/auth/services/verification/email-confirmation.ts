import { GET, PATCH } from "@/lib/http-methods";
import { AxiosError, AxiosHeaders } from "axios";

type AuthResponse = {
  status: number;
  ok: boolean;
  error?: string;
};

export async function confirmEmailOnServerSide(
  token: string
): Promise<AuthResponse> {
  const headers = {} as AxiosHeaders;

  try {
    await PATCH(`/auths/activate?token=${token}`, headers, {});

    return { status: 204, ok: true };
  } catch (error) {
    const axiosError = error as AxiosError;
    const responseError: AuthResponse = {
      status: axiosError?.response?.status
        ? axiosError.response.status
        : (400 as number),
      ok: false,
    };

    return responseError;
  }
}

export async function sendEmailConfirmationLink(
  token: string
): Promise<AuthResponse> {
  const headers = {} as AxiosHeaders;

  try {
    await GET(`/auths/activate/link?token=${token}`, headers, {});

    return { status: 200, ok: true };
  } catch (error) {
    const axiosError = error as AxiosError;

    const responseError: AuthResponse = {
      status: axiosError.status as number,
      error: "",
      ok: false,
    };

    return responseError;
  }
}
