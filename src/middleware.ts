import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

const protectedRoutes = ["/dashboard"];

export async function middleware(request: NextRequest) {
  const isRouteProtected = protectedRoutes.includes(request.nextUrl.pathname);

  if (!isRouteProtected) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
