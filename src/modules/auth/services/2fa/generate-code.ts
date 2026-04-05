import { POST } from "@/lib/http-methods";
import { Generate2FACodeType } from "@/modules/auth/types";
import { AxiosError, AxiosHeaders, AxiosResponse } from "axios";

/**
 * Generates a 2FA authentication code for passwordless login.
 *
 * Sends a request to the server to generate and send a 6-digit OTP code
 * to the provided email address or phone number.
 *
 * @param {Generate2FACodeType} data - The contact information for sending the code
 * @param {string} [data.email] - Email address to send the code to
 * @param {string} [data.phone] - Phone number to send the code to (at least one required)
 * @returns {Promise<{status: number, ok: boolean, errors?: string}>}
 *   - status: HTTP status code
 *   - ok: Whether the request was successful
 *   - errors: Error message if request failed
 */
export async function generate2FACode(data: Generate2FACodeType) {
  const headers = {} as AxiosHeaders;

  try {
    const res: AxiosResponse = await POST(`/auths/login/2fa/generate-code`, headers, data);

    return { status: res.status, ok: true };
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
