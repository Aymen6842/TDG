import { POST } from "@/lib/http-methods";
import { AxiosError } from "axios";
import { CustomError } from "@/utils/custom-error";

type AuthResponse = {
  status: number;
  ok: boolean;
  errors?: string;
};

export async function signUp(data: FormData): Promise<AuthResponse> {
  try {
    await POST(`/auths/register`, {}, data);

    return { status: 204, ok: true };
  } catch (error) {
    const axiosError = error as AxiosError<{ code: string; message: string }>;

    throw new CustomError(axiosError.message, axiosError?.response?.status || 500, axiosError.code);
  }
}
