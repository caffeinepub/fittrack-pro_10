import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Star, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { WorkoutPlan } from "../backend.d";
import { useWorkoutPlans } from "../hooks/useQueries";

const DIFFICULTY_CONFIG: Record<
  string,
  {
    color: string;
    label: string;
    stars: number;
    description: string;
    gradient: string;
    border: string;
  }
> = {
  beginner: {
    color: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/50",
    label: "Beginner",
    stars: 1,
    description:
      "Perfect for those just starting their fitness journey. 3 days per week with full-body focus.",
    gradient:
      "linear-gradient(135deg, oklch(0.15 0.04 142), oklch(0.10 0.01 142))",
    border: "border-emerald-500/30 hover:border-emerald-500/60",
  },
  intermediate: {
    color: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/50",
    label: "Intermediate",
    stars: 2,
    description:
      "For those with 6+ months of training experience. Push-Pull-Legs split, 4-5 days per week.",
    gradient:
      "linear-gradient(135deg, oklch(0.15 0.04 85), oklch(0.10 0.01 85))",
    border: "border-yellow-500/30 hover:border-yellow-500/60",
  },
  advanced: {
    color: "bg-red-500/15 text-red-400 border border-red-500/50",
    label: "Advanced",
    stars: 3,
    description:
      "High-intensity training for experienced athletes. 5-6 days per week with progressive overload.",
    gradient:
      "linear-gradient(135deg, oklch(0.15 0.04 25), oklch(0.10 0.01 25))",
    border: "border-red-500/30 hover:border-red-500/60",
  },
};

const STAR_POSITIONS = ["first", "second", "third"];

function PlanDetailSheet({
  plan,
  onClose,
}: { plan: WorkoutPlan; onClose: () => void }) {
  const key = plan.difficulty.toLowerCase();
  const config = DIFFICULTY_CONFIG[key] || DIFFICULTY_CONFIG.beginner;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center"
      style={{ maxWidth: "430px", left: "50%", transform: "translateX(-50%)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full bg-card rounded-t-3xl pb-10 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        data-ocid="plans.modal"
      >
        <div className="p-5 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">
              {config.label} Plan
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {plan.schedule.length} training days
            </p>
          </div>
          <button
            type="button"
            data-ocid="plans.close_button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">
          <p className="text-sm text-muted-foreground mb-5">
            {config.description}
          </p>
          <div className="flex flex-col gap-3">
            {plan.schedule.map(([day, exList]) => (
              <div key={day} className="bg-muted rounded-2xl p-4">
                <p className="font-semibold text-foreground mb-2 text-sm">
                  {day}
                </p>
                <div className="flex flex-col gap-1.5">
                  {exList.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Rest Day 😴</p>
                  ) : (
                    exList.map((ex) => (
                      <div
                        key={ex.id.toString()}
                        className="flex items-center gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-sm text-foreground">
                          {ex.name}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
          <Button
            data-ocid="plans.primary_button"
            className="w-full mt-5 rounded-xl font-semibold h-12"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.22 25), oklch(0.52 0.20 25))",
            }}
            onClick={onClose}
          >
            Start This Plan
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Plans() {
  const { data: plans = [], isLoading } = useWorkoutPlans();
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);

  const sortedPlans = [...plans].sort((a, b) => {
    const order: Record<string, number> = {
      beginner: 0,
      intermediate: 1,
      advanced: 2,
    };
    return (order[a.difficulty] ?? 0) - (order[b.difficulty] ?? 0);
  });

  return (
    <div className="min-h-full" data-ocid="plans.page">
      <div className="px-4 pt-12 pb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Workout Plans
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a plan that matches your fitness level
        </p>
      </div>

      <div className="px-4 flex flex-col gap-4 pb-6">
        {isLoading ? (
          <div data-ocid="plans.loading_state" className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : sortedPlans.length === 0 ? (
          <div
            data-ocid="plans.empty_state"
            className="text-center py-16 text-muted-foreground"
          >
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium">No plans available</p>
          </div>
        ) : (
          sortedPlans.map((plan, idx) => {
            const diffKey = plan.difficulty.toLowerCase();
            const config =
              DIFFICULTY_CONFIG[diffKey] || DIFFICULTY_CONFIG.beginner;
            return (
              <motion.button
                type="button"
                key={plan.difficulty}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                data-ocid={`plans.item.${idx + 1}`}
                onClick={() => setSelectedPlan(plan)}
                className={`rounded-2xl p-5 border cursor-pointer transition-all text-left w-full ${config.border}`}
                style={{ background: config.gradient }}
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge
                    className={`${config.color} font-semibold text-xs px-2.5 py-0.5`}
                  >
                    {config.label}
                  </Badge>
                  <div className="flex gap-0.5">
                    {STAR_POSITIONS.map((pos, i) => (
                      <Star
                        key={pos}
                        className={`h-4 w-4 ${
                          i < config.stars
                            ? "fill-fitness-orange text-fitness-orange"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-1">
                  {config.label} Program
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {config.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Days</p>
                      <p className="font-bold text-foreground">
                        {plan.schedule.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Exercises</p>
                      <p className="font-bold text-foreground">
                        {plan.schedule.reduce(
                          (acc, [, exs]) => acc + exs.length,
                          0,
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-primary text-sm font-medium">
                    View Plan <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {selectedPlan && (
          <PlanDetailSheet
            plan={selectedPlan}
            onClose={() => setSelectedPlan(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
