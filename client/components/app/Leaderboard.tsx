import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { firebase } from "@/lib/firebase";
import { onValue, ref } from "firebase/database";

export default function Leaderboard() {
  const [data, setData] = useState<Record<string, { points?: number }>>({});

  useEffect(() => {
    if (!firebase.isEnabled || !firebase.rtdb) return;
    const lbRef = ref(firebase.rtdb, "leaderboard");
    return onValue(lbRef, (snap) => setData((snap.val() as any) || {}));
  }, []);

  const items = useMemo(
    () =>
      Object.entries(data).map(([uid, v]) => ({ uid, points: v.points || 0 })),
    [data],
  );
  const top = useMemo(
    () => items.sort((a, b) => b.points - a.points).slice(0, 5),
    [items],
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>
          Earn points for logging moods, smart bin usage, and saving energy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {top.length === 0 && (
            <div className="text-sm text-muted-foreground">No entries yet</div>
          )}
          {top.map((r, i) => (
            <div
              key={r.uid}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs w-6 h-6 rounded-full bg-secondary grid place-items-center font-bold">
                  {i + 1}
                </span>
                <span className="font-medium">{r.uid.slice(0, 6)}…</span>
              </div>
              <div className="font-semibold">{r.points} pts</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
