import { ClipboardList, Dumbbell, Home, TrendingUp, User } from "lucide-react";
import { motion } from "motion/react";
import type { AppTab } from "../App";

const tabs: Array<{ id: AppTab; label: string; icon: React.ElementType }> = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "workout", label: "Workout", icon: Dumbbell },
  { id: "plans", label: "Plans", icon: ClipboardList },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "profile", label: "Profile", icon: User },
];

export default function BottomNav({
  activeTab,
  onNavigate,
}: {
  activeTab: AppTab;
  onNavigate: (tab: AppTab) => void;
}) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border flex z-50">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          data-ocid={`nav.${id}.link`}
          onClick={() => onNavigate(id)}
          className="flex-1 flex flex-col items-center py-3 gap-0.5 relative transition-colors"
        >
          {activeTab === id && (
            <motion.div
              layoutId="nav-indicator"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <Icon
            className={`h-5 w-5 transition-colors ${
              activeTab === id ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <span
            className={`text-[10px] font-medium transition-colors ${
              activeTab === id ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {label}
          </span>
        </button>
      ))}
    </nav>
  );
}
