/**
 * Unsigned JWT-shaped token for dashboard access until a real API exists.
 * Only used when DEV_AUTH_BYPASS is enabled.
 */
export function createDevJwt(
  claims: Record<string, unknown> = {},
  ttlSeconds = 60 * 60 * 24 * 30,
): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const header = toBase64Url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = toBase64Url(
    JSON.stringify({
      ...claims,
      exp,
      iat: Math.floor(Date.now() / 1000),
    }),
  );

  return `${header}.${payload}.dev`;
}

function toBase64Url(value: string): string {
  const base64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(value, "utf8").toString("base64")
      : btoa(value);

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
