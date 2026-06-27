// Guards redirect targets to known safe internal routes.
export const safeNextPath = (next: string | null): string => {
  // Reject protocol-relative ("//evil.com") and backslash ("/\evil.com") targets,
  // which start with "/" but resolve to absolute external URLs in the browser.
  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.startsWith("/\\") ||
    next.startsWith("/login")
  )
    return "/";
  if (next.startsWith("/signup")) return "/";
  return next;
};
