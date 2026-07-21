export const firebaseEnv = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "",
} as const;

export const firebaseConfig = {
  apiKey: firebaseEnv.apiKey,
  authDomain: firebaseEnv.authDomain,
  projectId: firebaseEnv.projectId,
  messagingSenderId: firebaseEnv.messagingSenderId,
  appId: firebaseEnv.appId,
} as const;

export function isFirebaseConfigured() {
  return Boolean(
    firebaseEnv.apiKey &&
      firebaseEnv.projectId &&
      firebaseEnv.messagingSenderId &&
      firebaseEnv.appId &&
      firebaseEnv.vapidKey,
  );
}

export function getMissingFirebaseEnvKeys() {
  const requiredKeys = [
    ["NEXT_PUBLIC_FIREBASE_API_KEY", firebaseEnv.apiKey],
    ["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", firebaseEnv.authDomain],
    ["NEXT_PUBLIC_FIREBASE_PROJECT_ID", firebaseEnv.projectId],
    ["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", firebaseEnv.messagingSenderId],
    ["NEXT_PUBLIC_FIREBASE_APP_ID", firebaseEnv.appId],
    ["NEXT_PUBLIC_FIREBASE_VAPID_KEY", firebaseEnv.vapidKey],
  ] as const;

  return requiredKeys
    .filter(([, value]) => !value)
    .map(([key]) => key);
}
