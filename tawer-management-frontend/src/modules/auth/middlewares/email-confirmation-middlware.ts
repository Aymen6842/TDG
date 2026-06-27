import { confirmEmailOnServerSide } from "@/modules/auth/services/verification/email-confirmation";
import { NextRequest } from "next/server";

export default async function emailConfirmationMiddlware(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  let responseStatus = "400";

  if (token) {
    const res = await confirmEmailOnServerSide(token);

    responseStatus = res.status.toString();
  }

  request.nextUrl.searchParams.set("status", responseStatus);
}
