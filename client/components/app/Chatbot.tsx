import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ensureSignedIn } from "@/lib/firebase";

const QA = [
  {
    q: "stress",
    a: "Try the 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s. Repeat 4 times.",
  },
  {
    q: "anxiety",
    a: "Grounding: name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.",
  },
  {
    q: "sleep",
    a: "Aim for a consistent sleep schedule. Avoid screens 1 hour before bed and keep your room cool and dark.",
  },
  {
    q: "study",
    a: "Pomodoro: 25 minutes focused study + 5 minute break. After 4 cycles, take a 20 minute rest.",
  },
  {
    q: "exercise",
    a: "A brisk 10–15 minute walk boosts mood and focus. Try it between classes.",
  },
  {
    q: "lonely",
    a: "Reach out to a friend or join a campus club. Connection is key—small steps count.",
  },
];

function replyFor(text: string) {
  const lower = text.toLowerCase();
  const hit = QA.find((p) => lower.includes(p.q));
  if (hit) return hit.a;
  return "I can help with stress, anxiety, sleep, study tips, exercise, or feeling lonely. Try asking about one of these.";
}

export default function Chatbot() {
  const [messages, setMessages] = useState<
    { role: "user" | "bot"; text: string }[]
  >([
    {
      role: "bot",
      text: "Hi! I’m your campus wellbeing buddy. How are you feeling today?",
    },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ensureSignedIn();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [
      ...m,
      { role: "user", text },
      { role: "bot", text: replyFor(text) },
    ]);
    setInput("");
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Mental Health Support</span>
          <span className="text-xs text-muted-foreground">Predefined Q&A</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 space-y-3 overflow-auto pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={m.role === "user" ? "text-right" : "text-left"}
            >
              <span
                className={
                  "inline-block px-3 py-2 rounded-lg max-w-[85%] " +
                  (m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground")
                }
              >
                {m.text}
              </span>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="mt-3 flex gap-2">
          <Input
            placeholder="Ask about stress, sleep, study tips..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <Button onClick={send}>Send</Button>
        </div>
      </CardContent>
    </Card>
  );
}
