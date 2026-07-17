export function isHiddenNavPath(pathname: string) {
  return (
    pathname === "/auth" ||
    pathname.startsWith("/auth/") ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/onboarding" ||
    pathname.startsWith("/onboarding/") ||
    pathname === "/groups" ||
    pathname.startsWith("/groups/") ||
    pathname === "/join" ||
    pathname.startsWith("/join/")
  );
}
