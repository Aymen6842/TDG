import { NextRequest, NextResponse } from "next/server";

export function setupResponseCookies(req: NextRequest, res: NextResponse) {
  //set up private access cookie if need
  if (req.cookies.get("tat"))
    res.cookies.set("tat", req.cookies.get("tat")?.value as string, {
      httpOnly: true,
    });

  //set up external auth cookies if needed
  if (req.cookies.get("x-At") && req.cookies.get("x-Rt")) {
    res.cookies.set("x-At", req.cookies.get("x-At")?.value as string, {
      maxAge: 120,
    });
    res.cookies.set("x-Rt", req.cookies.get("x-Rt")?.value as string, {
      maxAge: 120,
    });
  }
}
