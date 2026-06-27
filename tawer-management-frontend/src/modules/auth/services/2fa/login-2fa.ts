import { POST } from "@/lib/http-methods";
import { Login2FAType } from "@/modules/auth/types";
import { AxiosError, AxiosHeaders, AxiosResponse } from "axios";

/**
 * Authenticates user with 2FA code and stores authentication tokens.
 *
 * Verifies the provided OTP code against the server and, if valid,
 * stores the access and refresh tokens in localStorage for future requests.
 *
 * @param {Login2FAType} data - The authentication data
 * @param {string} [data.email] - Email address used for 2FA (optional if phone provided)
 * @param {string} [data.phone] - Phone number used for 2FA (optional if email provided)
 * @param {string} data.twoFactorAuthCode - The 6-digit OTP code
 * @returns {Promise<{status: number, ok: boolean, errors?: string, errorCode?: string}>}
 *   - status: HTTP status code
 *   - ok: Whether authentication was successful
 *   - errors: Error message if authentication failed
 *   - errorCode: Error code if authentication failed
 */
export async function login2FA(data: Login2FAType) {
  const headers = {} as AxiosHeaders;

  try {
    const res: AxiosResponse = await POST(`/auths/login/2fa`, headers, data);

    const tokens = res.data as { access: string; refresh: string };

    localStorage.setItem("access", tokens.access);
    localStorage.setItem("refresh", tokens.refresh);

    return { status: 204, ok: true };
  } catch (error) {
    const axiosError = error as AxiosError;

    const responseStatus = axiosError?.response?.status ? axiosError?.response?.status : 500;

    const errorMessage = (axiosError?.response?.data as any)?.message || "";
    const errorCode = (axiosError?.response?.data as any)?.code || "";

    return {
      status: responseStatus,
      errors: errorMessage,
      errorCode: errorCode,
      ok: false
    };
  }
}
