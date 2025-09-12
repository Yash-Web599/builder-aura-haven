import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { firebase, ensureSignedIn } from "@/lib/firebase";
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { addPoints } from "@/lib/points";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function MoodTracker() {
  const [mood, setMood] = useState<string>("3");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState<{ mood: number; ts: number }[]>([]);

  useEffect(() => {
    ensureSignedIn();
  }, []);

  useEffect(() => {
    if (!firebase.isEnabled || !firebase.firestore || !firebase.auth?.currentUser) return;
    const uid = firebase.auth.currentUser.uid;
    const moodsCol = collection(firebase.firestore, "moods");
    const q = query(moodsCol, orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const data: { mood: number; ts: number }[] = [];
      snap.forEach((doc) => {
        const d = doc.data() as any;
        if (d.uid === uid && d.mood) data.push({ mood: Number(d.mood), ts: d.timestamp?.toMillis?.() ?? d.timestamp ?? Date.now() });
      });
      setEntries(data.slice(-30));
    });
    return () => unsub();
  }, [firebase.isEnabled, firebase.firestore, firebase.auth?.currentUser?.uid]);

  async function submit() {
    if (!firebase.isEnabled || !firebase.firestore || !firebase.auth?.currentUser) return;
    const uid = firebase.auth.currentUser.uid;
    await addDoc(collection(firebase.firestore, "moods"), {
      uid,
      mood: Number(mood),
      note: note.trim() || null,
      timestamp: serverTimestamp(),
    });
    await addPoints(uid, 5, "mood_log");
    setNote("");
  }

  const chartData = useMemo(() => entries.map((e) => ({ x: new Date(e.ts).toLocaleDateString(), y: e.mood })), [entries]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Mood Tracker</CardTitle>
        <CardDescription>Log your mood daily and watch trends over time</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm font-medium mb-2">Mood (1–5)</div>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Very low</SelectItem>
                  <SelectItem value="2">2 - Low</SelectItem>
                  <SelectItem value="3">3 - Neutral</SelectItem>
                  <SelectItem value="4">4 - Good</SelectItem>
                  <SelectItem value="5">5 - Great</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Note (optional)</div>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What influenced your mood today?" rows={4} />
            </div>
          </div>
          <Button onClick={submit} className="bg-gradient-to-r from-emerald-500 to-cyan-500">Log Mood</Button>
        </div>
        <div className="h-56 md:h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <XAxis dataKey="x" tick={{ fontSize: 12 }} interval={Math.max(0, Math.floor(chartData.length / 6) - 1)} />
              <YAxis domain={[0, 5]} allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="y" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
