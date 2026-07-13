export function isHiddenNavPath(pathname: string) {
  return (
    pathname === "/auth" ||
    pathname.startsWith("/auth/") ||
    pathname === "/onboarding" ||
    pathname.startsWith("/onboarding/") ||
    pathname === "/groups" ||
    pathname.startsWith("/groups/")
  );
}
