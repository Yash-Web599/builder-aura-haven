import Chatbot from "@/components/app/Chatbot";
import MoodTracker from "@/components/app/MoodTracker";
import SosCard from "@/components/app/SosCard";
import EnergyWasteDashboard from "@/components/app/EnergyWasteDashboard";
import Leaderboard from "@/components/app/Leaderboard";

export default function Index() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-8 text-white">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">Smart Campus Wellbeing & Sustainability Hub</h1>
          <p className="mt-2 text-white/90 max-w-2xl">Chat with your wellbeing buddy, log your mood, send SOS with live location, and track real-time energy and smart bin usage. Earn points and climb the leaderboard.</p>
        </div>
        <div className="p-4 sm:p-6">
          <SosCard />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <Chatbot />
        </div>
        <div className="lg:col-span-7">
          <MoodTracker />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <EnergyWasteDashboard />
        </div>
        <div className="lg:col-span-4">
          <Leaderboard />
        </div>
      </section>
    </div>
  );
}
