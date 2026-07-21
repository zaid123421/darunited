import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";
import {
  firebaseConfig,
  isFirebaseConfigured,
} from "@/shared/config/firebase";

let app: FirebaseApp | null = null;
let messagingPromise: Promise<Messaging | null> | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) {
    return null;
  }

  if (!app) {
    app = getApps().length
      ? getApps()[0]!
      : initializeApp(firebaseConfig);
  }

  return app;
}

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (!isFirebaseConfigured()) {
    return null;
  }

  if (!messagingPromise) {
    messagingPromise = (async () => {
      const supported = await isSupported();

      if (!supported) {
        return null;
      }

      const firebaseApp = getFirebaseApp();

      if (!firebaseApp) {
        return null;
      }

      return getMessaging(firebaseApp);
    })();
  }

  return messagingPromise;
}
