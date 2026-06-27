// Ensures a redirect path stays within the app and avoids login loops.
export const safeNextPath = (next: string | null): string => {
  // Reject protocol-relative ("//evil.com") and backslash ("/\evil.com") targets,
  // which start with "/" but are resolved by the browser as absolute external URLs.
  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.startsWith("/\\") ||
    next.startsWith("/login")
  )
    return "/";
  return next;
};
