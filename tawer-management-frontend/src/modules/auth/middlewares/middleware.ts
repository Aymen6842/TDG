import { NextRequest, NextResponse } from "next/server";
import emailConfirmationMiddlware from "@/modules/auth/middlewares/email-confirmation-middlware";
import externalAuthMiddlware from "@/modules/auth/middlewares/external-auth-middlware";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  let urlUpdated = false;
  // let verifiedUserAccess = false;

  //this variable is used to handle the private access issue it will be deleted in public production env.

  // verification of the private access of the user
  // verifiedUserAccess = await privateAccessMiddleware(req);

  //check if lang is updated or to redirect user  if needed

  if (pathname.includes("/auth/activation-link")) {
    await emailConfirmationMiddlware(req);

    urlUpdated = true;
  } else if (pathname.includes("/google-auth") && req.nextUrl.searchParams.get("code")) {
    await externalAuthMiddlware(req, "google");

    urlUpdated = true;
  } else if (pathname.includes("/facebook-auth") && req.nextUrl.searchParams.get("code")) {
    await externalAuthMiddlware(req, "facebook");

    urlUpdated = true;
  }

  // if (!verifiedUserAccess && !externalAuthVerified)
  //   return NextResponse.redirect("https://test.tawer.tn/en-US/not-found");

  if (urlUpdated) {
    if (pathname !== req.nextUrl.pathname) {
      //only pathname is update
      return NextResponse.redirect(req.nextUrl);
    } //only url params are updated
    else return NextResponse.rewrite(req.nextUrl);
  }

  return NextResponse.next();
}
