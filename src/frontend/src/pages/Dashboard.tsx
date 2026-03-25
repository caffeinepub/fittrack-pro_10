import { Button } from "@/components/ui/button";
import {
  Calendar,
  ChevronRight,
  Flame,
  Play,
  Quote,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import type { AppTab } from "../App";
import type { WorkoutEntry } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUserProfile, useWorkoutHistory } from "../hooks/useQueries";

const MOTIVATIONAL_QUOTES = [
  {
    text: "The only bad workout is the one that didn't happen.",
    author: "Unknown",
  },
  {
    text: "Push yourself because no one else is going to do it for you.",
    author: "Unknown",
  },
  { text: "Success starts with self-discipline.", author: "Unknown" },
  {
    text: "Your body can stand almost anything. It's your mind you have to convince.",
    author: "Unknown",
  },
  {
    text: "The pain you feel today will be the strength you feel tomorrow.",
    author: "Unknown",
  },
  {
    text: "Don't stop when you're tired. Stop when you're done.",
    author: "Unknown",
  },
  { text: "Train insane or remain the same.", author: "Unknown" },
  { text: "It never gets easier, you just get stronger.", author: "Unknown" },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
  },
  {
    text: "Fitness is not about being better than someone else. It's about being better than you used to be.",
    author: "Unknown",
  },
  {
    text: "The hardest lift of all is lifting your butt off the couch.",
    author: "Unknown",
  },
  { text: "Sweat is just fat crying.", author: "Unknown" },
  {
    text: "Take care of your body. It's the only place you have to live.",
    author: "Jim Rohn",
  },
  {
    text: "Strength does not come from physical capacity. It comes from an indomitable will.",
    author: "Mahatma Gandhi",
  },
  {
    text: "The difference between try and triumph is a little umph.",
    author: "Marvin Phillips",
  },
  {
    text: "What seems impossible today will one day become your warm-up.",
    author: "Unknown",
  },
  {
    text: "Exercise is a celebration of what your body can do, not a punishment.",
    author: "Unknown",
  },
  { text: "Be stronger than your excuses.", author: "Unknown" },
  { text: "One rep at a time. One day at a time.", author: "Unknown" },
  {
    text: "Champions are made from something they have deep inside them — a desire, a dream, a vision.",
    author: "Muhammad Ali",
  },
  {
    text: "No matter how slow you go, you're still lapping everyone on the couch.",
    author: "Unknown",
  },
  {
    text: "The only way to define your limits is by going beyond them.",
    author: "Unknown",
  },
];

const DAILY_CHALLENGES = [
  {
    name: "Push Day Blitz",
    exercises: [
      { name: "Push-Ups", sets: 3, reps: 15 },
      { name: "Dumbbell Press", sets: 3, reps: 12 },
      { name: "Shoulder Press", sets: 3, reps: 10 },
      { name: "Tricep Dips", sets: 3, reps: 12 },
    ],
  },
  {
    name: "Leg Day Destroyer",
    exercises: [
      { name: "Squats", sets: 4, reps: 12 },
      { name: "Lunges", sets: 3, reps: 10 },
      { name: "Calf Raises", sets: 4, reps: 20 },
      { name: "Glute Bridges", sets: 3, reps: 15 },
    ],
  },
  {
    name: "Core Crusher",
    exercises: [
      { name: "Plank Hold", sets: 3, reps: 1 },
      { name: "Crunches", sets: 3, reps: 20 },
      { name: "Russian Twists", sets: 3, reps: 16 },
      { name: "Leg Raises", sets: 3, reps: 12 },
    ],
  },
  {
    name: "Pull Power",
    exercises: [
      { name: "Pull-Ups", sets: 3, reps: 8 },
      { name: "Bent-Over Rows", sets: 3, reps: 10 },
      { name: "Bicep Curls", sets: 3, reps: 12 },
      { name: "Face Pulls", sets: 3, reps: 15 },
    ],
  },
  {
    name: "Full Body Burn",
    exercises: [
      { name: "Burpees", sets: 3, reps: 10 },
      { name: "Mountain Climbers", sets: 3, reps: 20 },
      { name: "Jump Squats", sets: 3, reps: 12 },
      { name: "Push-Ups", sets: 3, reps: 15 },
    ],
  },
  {
    name: "Cardio & Strength",
    exercises: [
      { name: "Treadmill Run", sets: 1, reps: 1 },
      { name: "Deadlifts", sets: 4, reps: 8 },
      { name: "Jump Rope", sets: 3, reps: 1 },
      { name: "Dumbbell Rows", sets: 3, reps: 10 },
    ],
  },
  {
    name: "Upper Body Shred",
    exercises: [
      { name: "Bench Press", sets: 4, reps: 10 },
      { name: "Pull-Ups", sets: 3, reps: 8 },
      { name: "Lateral Raises", sets: 3, reps: 12 },
      { name: "Bicep Curls", sets: 3, reps: 12 },
    ],
  },
];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function calculateStreak(history: WorkoutEntry[]): number {
  const dates = new Set(history.map((e) => e.date));
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (dates.has(formatDate(d))) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

function getWeekDays(workoutDates: Set<string>) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    const dateStr = formatDate(d);
    return {
      label,
      dateStr,
      hasWorkout: workoutDates.has(dateStr),
      isToday: dateStr === formatDate(today),
    };
  });
}

const WEEK_HEADER_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function MiniCalendar({ workoutDates }: { workoutDates: Set<string> }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const todayStr = formatDate(today);
  const monthName = today.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const cells: Array<{ day: number | null; dateStr: string }> = [];
  for (let i = 0; i < offset; i++)
    cells.push({ day: null, dateStr: `empty-${i}` });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    cells.push({ day: d, dateStr: formatDate(date) });
  }

  return (
    <div className="bg-card rounded-2xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">
          {monthName}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEK_HEADER_LABELS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-medium text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          if (!cell.day) return <div key={cell.dateStr} />;
          const isToday = cell.dateStr === todayStr;
          const hasWorkout = workoutDates.has(cell.dateStr);
          return (
            <div
              key={cell.dateStr}
              className="relative flex items-center justify-center"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                  isToday
                    ? "bg-primary text-primary-foreground font-bold"
                    : hasWorkout
                      ? "bg-accent/20 text-accent"
                      : "text-foreground/60"
                }`}
              >
                {cell.day}
              </div>
              {hasWorkout && !isToday && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard({
  onNavigate,
}: { onNavigate: (tab: AppTab) => void }) {
  const { identity } = useInternetIdentity();
  const { data: history = [] } = useWorkoutHistory();
  const { data: profile } = useUserProfile();

  const workoutDates = useMemo(
    () => new Set(history.map((e) => e.date)),
    [history],
  );
  const streak = useMemo(() => calculateStreak(history), [history]);
  const weekDays = useMemo(() => getWeekDays(workoutDates), [workoutDates]);
  const weeklyCount = weekDays.filter((d) => d.hasWorkout).length;
  const totalWorkouts = history.length;

  const dayOfYear = getDayOfYear();
  const todayQuote =
    MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
  const todayChallenge = DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];

  const displayName = profile?.name || "Athlete";
  const goal = profile?.goal;
  const goalLabel: Record<string, string> = {
    fatLoss: "Fat Loss",
    muscleGain: "Muscle Gain",
    endurance: "Endurance",
    generalFitness: "General Fitness",
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const statsItems = [
    {
      label: "This Week",
      value: weeklyCount,
      icon: Zap,
      color: "text-fitness-blue",
      small: false,
    },
    {
      label: "Total",
      value: totalWorkouts,
      icon: Trophy,
      color: "text-fitness-green",
      small: false,
    },
    {
      label: "Goal",
      value: goal ? goalLabel[goal] || "—" : identity ? "Set Goal" : "Login",
      icon: Target,
      color: "text-fitness-orange",
      small: true,
    },
  ];

  return (
    <div className="min-h-full pb-4" data-ocid="dashboard.page">
      <div className="px-4 pt-12 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-muted-foreground text-sm mb-1">{today}</p>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {getGreeting()},{" "}
            <span className="text-gradient-red">{displayName}</span> 👋
          </h1>
        </motion.div>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Motivational Quote */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 }}
          className="rounded-2xl p-4 border border-primary/20 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.13 0.02 25), oklch(0.10 0.005 25))",
          }}
        >
          <Quote className="absolute top-3 right-3 h-8 w-8 text-primary/10" />
          <p className="text-sm text-foreground/90 italic leading-relaxed pr-8">
            &ldquo;{todayQuote.text}&rdquo;
          </p>
          {todayQuote.author !== "Unknown" && (
            <p className="text-xs text-primary mt-2 font-medium">
              — {todayQuote.author}
            </p>
          )}
        </motion.div>

        {/* Daily Challenge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="rounded-2xl border border-primary/30 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.14 0.03 25), oklch(0.10 0.01 25))",
          }}
          data-ocid="dashboard.card"
        >
          <div className="p-4 pb-3">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Daily Challenge
              </span>
            </div>
            <h3 className="text-lg font-display font-bold text-foreground mb-3">
              {todayChallenge.name}
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {todayChallenge.exercises.map((ex) => (
                <div
                  key={ex.name}
                  className="flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {ex.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {ex.sets} × {ex.reps === 1 ? "timed" : `${ex.reps} reps`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              data-ocid="dashboard.primary_button"
              onClick={() => onNavigate("workout")}
              className="w-full h-11 text-sm font-bold rounded-xl glow-primary gap-2"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.22 25), oklch(0.52 0.20 25))",
              }}
            >
              <Play className="h-4 w-4" />
              Start Challenge
            </Button>
          </div>
        </motion.div>

        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden rounded-2xl p-5 border border-fitness-orange/40 glow-fire"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.15 0.04 55), oklch(0.10 0.01 55))",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-5 w-5 text-fitness-orange" />
                <span className="text-sm font-medium text-fitness-orange">
                  Current Streak
                </span>
              </div>
              <div className="text-5xl font-display font-black text-foreground">
                {streak}
                <span className="text-2xl text-muted-foreground ml-2">
                  days
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {streak === 0
                  ? "Start your streak today!"
                  : streak === 1
                    ? "Great start! Keep it going."
                    : `${streak} consecutive days 🔥`}
              </p>
            </div>
            <div className="text-6xl opacity-20">🔥</div>
          </div>
        </motion.div>

        {/* Weekly Days */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-4 border border-border"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">
              This Week
            </span>
            <span className="text-xs text-muted-foreground">
              {weeklyCount}/7 days
            </span>
          </div>
          <div className="flex gap-1.5">
            {weekDays.map(({ label, hasWorkout, isToday, dateStr }) => (
              <div
                key={dateStr}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-[10px] text-muted-foreground">
                  {label}
                </span>
                <div
                  className={`w-full h-8 rounded-lg flex items-center justify-center transition-all ${
                    isToday
                      ? hasWorkout
                        ? "bg-primary glow-primary"
                        : "border-2 border-primary"
                      : hasWorkout
                        ? "bg-accent/80"
                        : "bg-muted"
                  }`}
                >
                  {hasWorkout && (
                    <Zap
                      className={`h-3 w-3 ${isToday ? "text-white" : "text-accent-foreground"}`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-3"
        >
          {statsItems.map(({ label, value, icon: Icon, color, small }) => (
            <div
              key={label}
              className="bg-card rounded-2xl p-3 border border-border flex flex-col gap-1"
            >
              <Icon className={`h-4 w-4 ${color}`} />
              <span
                className={`font-display font-bold text-foreground leading-none ${small ? "text-base" : "text-2xl"}`}
              >
                {value}
              </span>
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Quick Start (non-challenge) */}
        {!identity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-5 border border-border text-center"
          >
            <p className="text-muted-foreground text-sm">
              Login to track your workouts &amp; progress
            </p>
          </motion.div>
        )}

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <MiniCalendar workoutDates={workoutDates} />
        </motion.div>

        {/* Plans CTA */}
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          data-ocid="dashboard.secondary_button"
          onClick={() => onNavigate("plans")}
          className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-xl">📋</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">
                Workout Plans
              </p>
              <p className="text-xs text-muted-foreground">
                Beginner to Advanced
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </motion.button>

        <div className="text-center pt-2 pb-2">
          <p className="text-xs text-muted-foreground/50">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-muted-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
