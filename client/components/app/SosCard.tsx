import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { firebase, ensureSignedIn, triggerSosFunction } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function SosCard() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function sendSOS() {
    await ensureSignedIn();
    if (!navigator.geolocation) {
      setStatus("Geolocation not supported");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          if (!firebase.isEnabled || !firebase.firestore || !firebase.auth?.currentUser) {
            setStatus("Firebase not configured");
            setLoading(false);
            return;
          }
          const payload = {
            uid: firebase.auth.currentUser.uid,
            coords: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            },
            timestamp: serverTimestamp(),
            status: "open",
          };
          await addDoc(collection(firebase.firestore, "sos_alerts"), payload);
          const call = await triggerSosFunction({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: Date.now(),
          });
          setStatus(call.ok ? "SOS sent (SMS/Email triggered)" : "SOS stored. Notify service not configured");
        } catch (e) {
          setStatus((e as Error).message);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setStatus(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Campus Safety</CardTitle>
        <CardDescription>Share your live location with campus security</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button size="lg" disabled={loading} onClick={sendSOS} className="bg-red-500 hover:bg-red-600 text-white">{loading ? "Sending..." : "Send SOS"}</Button>
        {status && <div className="text-sm text-muted-foreground">{status}</div>}
      </CardContent>
    </Card>
  );
}
