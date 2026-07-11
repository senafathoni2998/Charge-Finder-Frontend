import { describe, it, expect, vi, afterEach } from "vitest";

// The module reads VITE_APP_ASSET_URL at import time, so tests that need a
// specific base URL re-import it with vi.resetModules() after stubbing the env.
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("resolveAssetUrl", () => {
  it("returns null for empty/non-string input", async () => {
    const { resolveAssetUrl } = await import("../assets");
    expect(resolveAssetUrl(null)).toBeNull();
    expect(resolveAssetUrl(undefined)).toBeNull();
    expect(resolveAssetUrl("")).toBeNull();
    expect(resolveAssetUrl("   ")).toBeNull();
    expect(resolveAssetUrl(123)).toBeNull();
  });

  it("passes absolute http/data/blob URLs through unchanged", async () => {
    const { resolveAssetUrl } = await import("../assets");
    expect(resolveAssetUrl("https://cdn.example.com/a.png")).toBe(
      "https://cdn.example.com/a.png"
    );
    expect(resolveAssetUrl("data:image/png;base64,AAAA")).toBe(
      "data:image/png;base64,AAAA"
    );
    expect(resolveAssetUrl("blob:http://x/y")).toBe("blob:http://x/y");
  });

  it("makes a relative path root-relative when no asset base URL is set", async () => {
    vi.stubEnv("VITE_APP_ASSET_URL", "");
    vi.resetModules();
    const { resolveAssetUrl } = await import("../assets");
    // Leading slash so it resolves against the site root on any route depth.
    expect(resolveAssetUrl("uploads/images/2026/07/x.png")).toBe(
      "/uploads/images/2026/07/x.png"
    );
    expect(resolveAssetUrl("/uploads/images/x.png")).toBe(
      "/uploads/images/x.png"
    );
  });

  it("prefixes a relative path with the configured asset base URL", async () => {
    vi.stubEnv("VITE_APP_ASSET_URL", "https://api.example.com/");
    vi.resetModules();
    const { resolveAssetUrl } = await import("../assets");
    expect(resolveAssetUrl("uploads/images/x.png")).toBe(
      "https://api.example.com/uploads/images/x.png"
    );
    expect(resolveAssetUrl("/uploads/images/x.png")).toBe(
      "https://api.example.com/uploads/images/x.png"
    );
  });
});

describe("isAllowedImageType", () => {
  it("accepts exactly png/jpeg/jpg and rejects everything else", async () => {
    const { isAllowedImageType } = await import("../assets");
    const make = (type: string) => new File(["x"], "f", { type });
    expect(isAllowedImageType(make("image/png"))).toBe(true);
    expect(isAllowedImageType(make("image/jpeg"))).toBe(true);
    expect(isAllowedImageType(make("image/jpg"))).toBe(true);
    expect(isAllowedImageType(make("image/webp"))).toBe(false);
    expect(isAllowedImageType(make("image/gif"))).toBe(false);
    expect(isAllowedImageType(make("image/svg+xml"))).toBe(false);
    expect(isAllowedImageType(make("application/pdf"))).toBe(false);
    expect(isAllowedImageType(make(""))).toBe(false);
  });
});
