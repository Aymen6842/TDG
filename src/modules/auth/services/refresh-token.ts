import { POST } from "@/lib/http-methods";
import { AxiosHeaders, AxiosResponse } from "axios";
import extractJWTokens from "../utils/jwt/extract-tokens";

export async function refreshToken(onSuccess: () => any) {
  const { refresh } = extractJWTokens();
  const headers = {} as AxiosHeaders;

  try {
    const res: AxiosResponse = await POST(`/tokens/refresh`, headers, {
      token: refresh
    });

    localStorage.setItem("access", res.data.access);

    return onSuccess();
  } catch {
    return null;
  }
}
