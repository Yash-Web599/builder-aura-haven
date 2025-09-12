import { firebase } from "@/lib/firebase";
import { ref, runTransaction, push, serverTimestamp } from "firebase/database";

export async function addPoints(uid: string, delta: number, reason: string) {
  if (!firebase.isEnabled || !firebase.rtdb) return;
  const lbRef = ref(firebase.rtdb, `leaderboard/${uid}`);
  await runTransaction(lbRef, (current: any) => {
    const next = current ?? { points: 0, history: {} };
    next.points = (next.points || 0) + delta;
    return next;
  });
  const historyRef = ref(firebase.rtdb, `leaderboard/${uid}/history`);
  await push(historyRef, { delta, reason, ts: Date.now() });
}

export function recordEvent(path: string, payload: any) {
  if (!firebase.isEnabled || !firebase.rtdb) return Promise.resolve();
  const eventsRef = ref(firebase.rtdb, `${path}`);
  return push(eventsRef, { ...payload, ts: serverTimestamp() });
}
