interface JwtPayload {
  exp?: number;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) {
      return null;
    }

    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), "=");
    const json =
      typeof atob !== "undefined"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf8");

    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isJwtExpired(
  token: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return true;
  }

  return payload.exp <= nowSeconds;
}

export function getJwtExp(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (payload?.exp === undefined || payload?.exp === null) {
    return null;
  }

  return payload.exp;
}

export function getJwtRemainingSeconds(
  token: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): number {
  const exp = getJwtExp(token);
  if (exp === null) {
    return 0;
  }

  return Math.max(0, exp - nowSeconds);
}
