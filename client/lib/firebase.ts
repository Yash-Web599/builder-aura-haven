import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, signInAnonymously, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, type User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getFunctions, httpsCallable } from "firebase/functions";

export type FirebaseServices = {
  app: FirebaseApp | null;
  isEnabled: boolean;
  auth: ReturnType<typeof getAuth> | null;
  firestore: ReturnType<typeof getFirestore> | null;
  rtdb: ReturnType<typeof getDatabase> | null;
  functions: ReturnType<typeof getFunctions> | null;
};

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL as string | undefined,
};

const requiredKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "appId",
];

const hasAllRequired = requiredKeys.every((k) => (config as any)[k]);

let services: FirebaseServices = {
  app: null,
  isEnabled: false,
  auth: null,
  firestore: null,
  rtdb: null,
  functions: null,
};

if (hasAllRequired) {
  const app = getApps().length ? getApps()[0] : initializeApp(config as any);
  services = {
    app,
    isEnabled: true,
    auth: getAuth(app),
    firestore: getFirestore(app),
    rtdb: getDatabase(app),
    functions: getFunctions(app),
  };
}

export const firebase = services;

export async function ensureSignedIn(): Promise<User | null> {
  if (!firebase.isEnabled || !firebase.auth) return null;
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(firebase.auth!, async (user) => {
      if (user) {
        unsub();
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(firebase.auth!);
          unsub();
          resolve(cred.user ?? null);
        } catch (e) {
          unsub();
          resolve(null);
        }
      }
    });
  });
}

export async function signInWithGoogle(): Promise<User | null> {
  if (!firebase.isEnabled || !firebase.auth) return null;
  try {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(firebase.auth, provider);
    return res.user ?? null;
  } catch (e) {
    return null;
  }
}

export async function triggerSosFunction(payload: { lat: number; lng: number; accuracy?: number; timestamp: number }) {
  if (!firebase.isEnabled || !firebase.functions) return { ok: false, error: "Firebase not configured" };
  try {
    const callable = httpsCallable(firebase.functions, "sendSosAlert");
    await callable(payload);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
