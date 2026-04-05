import { POST } from "@/lib/http-methods";
import { AxiosError, AxiosHeaders } from "axios";

type AuthResponse = {
  status: number;
  ok: boolean;
};

export async function verifyPrivateAccessToken(
  token: string
): Promise<AuthResponse> {
  const headers = {} as AxiosHeaders;

  try {
    await POST(
      `${process.env.PRIVATE_ACCESS_BACKEND_ADDRESS}/api/auth/verify-token`,
      headers,
      { companyName: "parastore", token }
    );

    return {
      status: 200,
      ok: true,
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    const responseError: AuthResponse = {
      status: axiosError?.response?.status
        ? (axiosError?.response?.status as number)
        : 500,
      ok: false,
    };

    return responseError;
  }
}
