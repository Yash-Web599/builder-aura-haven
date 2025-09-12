import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { firebase } from "@/lib/firebase";
import { onValue, ref } from "firebase/database";

type EnergyRoom = { lightOn?: boolean; usage?: number; updatedAt?: number };

export default function EnergyWasteDashboard() {
  const [energy, setEnergy] = useState<Record<string, EnergyRoom>>({});
  const [bins, setBins] = useState<
    Record<string, { wet?: number; dry?: number }>
  >({});

  useEffect(() => {
    if (!firebase.isEnabled || !firebase.rtdb) return;
    const unsubs: (() => void)[] = [];
    const eRef = ref(firebase.rtdb, "energy");
    unsubs.push(onValue(eRef, (snap) => setEnergy((snap.val() as any) || {})));
    const bRef = ref(firebase.rtdb, "bins");
    unsubs.push(onValue(bRef, (snap) => setBins((snap.val() as any) || {})));
    return () => unsubs.forEach((u) => u());
  }, []);

  const rooms = Object.entries(energy);
  const binList = Object.entries(bins);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Energy & Waste</CardTitle>
        <CardDescription>
          Real-time classroom energy and smart bin usage
        </CardDescription>
      </CardHeader>
      <CardContent className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-semibold mb-2">Classroom Energy</div>
          <div className="space-y-2">
            {rooms.length === 0 && (
              <div className="text-sm text-muted-foreground">No data yet</div>
            )}
            {rooms.map(([id, r]) => (
              <div
                key={id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="font-medium">{id}</div>
                <div
                  className={
                    "text-sm " +
                    (r.lightOn ? "text-emerald-600" : "text-muted-foreground")
                  }
                >
                  {r.lightOn ? "Lights ON" : "Lights OFF"}
                </div>
                <div className="text-sm font-semibold">
                  {Math.round(r.usage || 0)} Wh
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold mb-2">Smart Bin Stats</div>
          <div className="space-y-2">
            {binList.length === 0 && (
              <div className="text-sm text-muted-foreground">No data yet</div>
            )}
            {binList.map(([id, b]) => (
              <div
                key={id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="font-medium">{id}</div>
                <div className="text-sm">
                  Wet:{" "}
                  <span className="font-semibold text-emerald-600">
                    {b.wet ?? 0}
                  </span>
                </div>
                <div className="text-sm">
                  Dry:{" "}
                  <span className="font-semibold text-cyan-600">
                    {b.dry ?? 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
