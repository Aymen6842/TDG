import { verifyPrivateAccessToken } from "@/modules/auth/services/platform-private-access";
import { NextRequest } from "next/server";

export default async function privateAccessMiddleware(request: NextRequest) {
  let accessToken: string;
  let updateCookies = false;

  //verification of access token
  if (request.nextUrl.pathname.includes("/private-access")) {
    if (request.nextUrl.searchParams.get("tat")) {
      //user is coming from tawer tester we need to se up a cookie
      accessToken = request.nextUrl.searchParams.get("tat") as string;

      updateCookies = true;
    } //user is coming from tawer tester without a cookie
    else return false;
  } else {
    //user is enjoying the website with it authorized cookie
    if (request.cookies.get("tat") && request.cookies.get("tat")?.value)
      accessToken = request.cookies.get("tat")?.value as string;
    //user is enjoying the website without authorization
    else return false;
  }

  //verifiction of the user access token
  const access = await verifyPrivateAccessToken(accessToken as string);

  if (updateCookies) request.nextUrl.searchParams.delete("tat");

  //give user the access to prevent redirection to not found pages
  if (access.ok) {
    //set up cookie and redirect to home page for the first join
    if (updateCookies) {
      request.cookies.set("tat", accessToken);
      request.nextUrl.pathname = "/";
    }
    return true;
  }

  return false;
}
