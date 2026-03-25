import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import BottomNav from "./components/BottomNav";
import Dashboard from "./pages/Dashboard";
import Plans from "./pages/Plans";
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import Workout from "./pages/Workout";

export type AppTab = "dashboard" | "workout" | "plans" | "progress" | "profile";

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("dashboard");

  return (
    <div
      className="flex justify-center min-h-screen"
      style={{ background: "#050505" }}
    >
      <div className="w-full max-w-[430px] min-h-screen bg-background flex flex-col relative">
        <main className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
          {activeTab === "dashboard" && <Dashboard onNavigate={setActiveTab} />}
          {activeTab === "workout" && <Workout />}
          {activeTab === "plans" && <Plans />}
          {activeTab === "progress" && <Progress />}
          {activeTab === "profile" && <Profile />}
        </main>
        <BottomNav activeTab={activeTab} onNavigate={setActiveTab} />
        <Toaster position="top-center" richColors />
      </div>
    </div>
  );
}
