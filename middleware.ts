import { type NextRequest } from "next/server";

import { updateSession } from "@/src/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  // Preserve existing pathname header used by the shell layout.
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets.
     * Session refresh runs on page navigations so cookies stay valid after long sleep.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
