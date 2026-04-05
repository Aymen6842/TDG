import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
// import privateAccessMiddleware from "./modules/auth/middlewares/private-access-middlware";
// import externalAuthMiddlware from "./modules/auth/middlewares/external-auth-middlware";
// import { setupResponseCookies } from "./modules/auth/middlewares/middleware-cookies";

const intlMiddleware = createMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
  localePrefix: routing.localePrefix,
  domains: routing.domains
});

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Run intl middleware first to get the base response
  const response = intlMiddleware(req);

  // 2. Custom logic
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  // const verifiedUserAccess = await privateAccessMiddleware(req);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const externalAuthVerified = false;

  let urlUpdated = false;

  if (pathname.includes("/google-auth") && req.nextUrl.searchParams.get("code")) {
    // externalAuthVerified = await externalAuthMiddlware(req, "google");
    urlUpdated = true;
  }

  if (urlUpdated) {
    if (pathname !== req.nextUrl.pathname) {
      const res = NextResponse.redirect(req.nextUrl);
      // setupResponseCookies(req, res);
      return res;
    } else {
      return NextResponse.rewrite(req.nextUrl);
    }
  }

  // 3. Return the intl-middleware-enhanced response
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|_vercel|.*\\..*).*)"]
};
