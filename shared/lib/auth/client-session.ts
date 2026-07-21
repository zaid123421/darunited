const OTP_TOKEN_KEY = "du_otp_access_token";
const ACCESS_TOKEN_KEY = "du_access_token";
const REFRESH_TOKEN_KEY = "du_refresh_token";
const USER_KEY = "du_user";
const USER_SESSION_EVENT = "du-user-session-change";

let cachedUserRaw: string | null | undefined;
let cachedUserSnapshot: unknown = null;

function notifyUserSessionChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(USER_SESSION_EVENT));
}

function readStorage(key: string) {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(key);
}

function writeStorage(key: string, value: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (value) {
    window.sessionStorage.setItem(key, value);
    return;
  }

  window.sessionStorage.removeItem(key);
}

function readPersistentStorage(key: string) {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(key);
}

function writePersistentStorage(key: string, value: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (value) {
    window.localStorage.setItem(key, value);
    return;
  }

  window.localStorage.removeItem(key);
}

function readCachedUser<T>() {
  const raw = readPersistentStorage(USER_KEY);

  if (raw === cachedUserRaw) {
    return cachedUserSnapshot as T | null;
  }

  cachedUserRaw = raw;

  if (!raw) {
    cachedUserSnapshot = null;
    return null;
  }

  try {
    cachedUserSnapshot = JSON.parse(raw) as T;
    return cachedUserSnapshot as T;
  } catch {
    cachedUserSnapshot = null;
    return null;
  }
}

function writeCachedUser<T>(user: T | null) {
  if (user === null) {
    writePersistentStorage(USER_KEY, null);
    cachedUserRaw = null;
    cachedUserSnapshot = null;
    return;
  }

  const serialized = JSON.stringify(user);
  writePersistentStorage(USER_KEY, serialized);
  cachedUserRaw = serialized;
  cachedUserSnapshot = user;
}

export const clientSession = {
  getOtpToken() {
    return readStorage(OTP_TOKEN_KEY);
  },

  setOtpToken(token: string) {
    writeStorage(OTP_TOKEN_KEY, token);
  },

  getAccessToken() {
    return readStorage(ACCESS_TOKEN_KEY);
  },

  getRefreshToken() {
    return readStorage(REFRESH_TOKEN_KEY);
  },

  setTokens(tokens: {
    access_token: string;
    refresh_token: string;
  }) {
    writeStorage(ACCESS_TOKEN_KEY, tokens.access_token);
    writeStorage(REFRESH_TOKEN_KEY, tokens.refresh_token);
    writeStorage(OTP_TOKEN_KEY, null);
  },

  getUser<T>() {
    return readCachedUser<T>();
  },

  setUser<T>(user: T) {
    writeCachedUser(user);
    notifyUserSessionChange();
  },

  clear() {
    writeStorage(OTP_TOKEN_KEY, null);
    writeStorage(ACCESS_TOKEN_KEY, null);
    writeStorage(REFRESH_TOKEN_KEY, null);
    writeCachedUser(null);
    notifyUserSessionChange();
  },
};
