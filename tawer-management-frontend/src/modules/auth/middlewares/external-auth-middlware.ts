import { verifyExternalAuthCode } from "@/modules/auth/services/verification/external-auth";
import { NextRequest } from "next/server";

export default async function externalAuthMiddlware(
  request: NextRequest,
  auth: "google" | "facebook"
) {
  const authCode = request.nextUrl.searchParams.get("code");

  const res = await verifyExternalAuthCode(authCode as string, auth);

  //cleaning url
  request.nextUrl.pathname = request.nextUrl.pathname.replace(
    auth === "google" ? "/google-auth" : "/facebook-auth",
    "/"
  );

  request.nextUrl.searchParams.delete("code");
  request.nextUrl.searchParams.delete("scope");
  request.nextUrl.searchParams.delete("prompt");
  request.nextUrl.searchParams.delete("authuser");

  if (res.ok && res.data) {
    request.cookies.set("x-At", res.data.at);
    request.cookies.set("x-Rt", res.data.rt);

    return true;
  } else {
    request.nextUrl.searchParams.set("auth", "failed");
    request.nextUrl.searchParams.set("status", res.status.toString());
  }

  request.nextUrl.pathname = "";

  return false;
}
