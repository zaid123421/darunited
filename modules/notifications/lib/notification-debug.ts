import { env } from "@/shared/config/env";

export function logNotificationDebug(message: string, details?: unknown) {
  if (env.IS_PRODUCTION) {
    return;
  }

  if (details === undefined) {
    console.info(`[notifications] ${message}`);
    return;
  }

  console.info(`[notifications] ${message}`, details);
}

export function maskFcmToken(token: string) {
  if (token.length <= 20) {
    return token;
  }

  return `${token.slice(0, 12)}...${token.slice(-8)}`;
}
