import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Check,
  ChevronDown,
  Clock,
  Dumbbell,
  Play,
  Plus,
  Search,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MuscleGroup } from "../backend.d";
import type { Exercise } from "../backend.d";
import TimerSheet from "../components/TimerSheet";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddWorkoutEntry,
  useCreateWorkoutSession,
  useExercises,
} from "../hooks/useQueries";

const MUSCLE_GROUPS: Array<{ label: string; value: MuscleGroup | "all" }> = [
  { label: "All", value: "all" },
  { label: "Chest", value: MuscleGroup.chest },
  { label: "Back", value: MuscleGroup.back },
  { label: "Legs", value: MuscleGroup.legs },
  { label: "Shoulders", value: MuscleGroup.shoulders },
  { label: "Arms", value: MuscleGroup.arms },
  { label: "Core", value: MuscleGroup.core },
  { label: "Cardio", value: MuscleGroup.cardio },
];

const MUSCLE_ICONS: Record<string, string> = {
  chest: "💪",
  back: "🏋️",
  legs: "🦵",
  shoulders: "🤸",
  arms: "💪",
  core: "🔥",
  cardio: "🏃",
};

const MUSCLE_COLORS: Record<string, string> = {
  chest: "bg-blue-500/20 text-blue-400",
  back: "bg-emerald-500/20 text-emerald-400",
  legs: "bg-purple-500/20 text-purple-400",
  shoulders: "bg-amber-500/20 text-amber-400",
  arms: "bg-red-500/20 text-red-400",
  core: "bg-orange-500/20 text-orange-400",
  cardio: "bg-pink-500/20 text-pink-400",
};

// Difficulty filter: beginner = chest/arms, intermediate = + back/shoulders, advanced = all
const DIFFICULTY_MUSCLE_MAP: Record<string, Set<string>> = {
  beginner: new Set(["chest", "arms", "core", "cardio"]),
  intermediate: new Set([
    "chest",
    "arms",
    "core",
    "cardio",
    "back",
    "shoulders",
  ]),
  advanced: new Set([
    "chest",
    "arms",
    "core",
    "cardio",
    "back",
    "shoulders",
    "legs",
  ]),
};

const exerciseDetails: Record<
  number,
  { steps: string[]; sets: number; reps: number }
> = {
  1: {
    steps: [
      "Get into a high plank position, hands shoulder-width apart",
      "Lower your body until your chest nearly touches the floor, keeping elbows at 45 degrees",
      "Exhale as you push up, inhale as you lower down",
    ],
    sets: 3,
    reps: 12,
  },
  2: {
    steps: [
      "Stand with feet shoulder-width apart, toes slightly out",
      "Bend at knees and hips, lowering until thighs are parallel to floor",
      "Breathe in on the way down, exhale forcefully as you stand",
    ],
    sets: 4,
    reps: 10,
  },
  3: {
    steps: [
      "Place forearms on floor, elbows under shoulders, feet together",
      "Hold body in straight line from head to heels, engage core",
      "Breathe slowly and steadily throughout the hold",
    ],
    sets: 3,
    reps: 1,
  },
  4: {
    steps: [
      "Set treadmill to comfortable walking or jogging pace",
      "Maintain upright posture, arms swinging naturally",
      "Breathe rhythmically — inhale 2 steps, exhale 2 steps",
    ],
    sets: 1,
    reps: 1,
  },
  5: {
    steps: [
      "Hang from bar with hands slightly wider than shoulder-width",
      "Pull yourself up until chin clears the bar, engaging lats",
      "Exhale on the pull up, inhale as you lower back down",
    ],
    sets: 3,
    reps: 8,
  },
  6: {
    steps: [
      "Stand with dumbbells at sides, palms facing forward",
      "Curl weights up toward shoulders, keeping elbows stationary",
      "Exhale on the curl, inhale as you lower the weight",
    ],
    sets: 3,
    reps: 12,
  },
  7: {
    steps: [
      "Hold dumbbells at shoulder height, elbows at 90 degrees",
      "Press weights overhead until arms are fully extended",
      "Exhale on the press, inhale as you return to start",
    ],
    sets: 3,
    reps: 10,
  },
  8: {
    steps: [
      "Stand tall, step forward with one foot into a long stride",
      "Lower back knee toward floor, front thigh parallel to ground",
      "Exhale stepping forward, inhale as you return to standing",
    ],
    sets: 3,
    reps: 10,
  },
  9: {
    steps: [
      "Stand with barbell on floor, feet hip-width apart, hinge at hips",
      "Keep back straight, drive through heels lifting bar to hip level",
      "Inhale before the lift, exhale forcefully at the top",
    ],
    sets: 4,
    reps: 6,
  },
  10: {
    steps: [
      "Lie on back, knees bent, hands lightly touching temples",
      "Contract abs to lift shoulder blades off floor, don't pull neck",
      "Exhale as you crunch up, inhale as you lower back down",
    ],
    sets: 3,
    reps: 20,
  },
};

const STEP_LABELS = ["Starting Position", "Movement", "Breathing Technique"];

interface WorkingSet {
  weight: string;
  reps: string;
  done: boolean;
}

interface WorkingExercise {
  exercise: Exercise;
  sets: WorkingSet[];
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function ExerciseDetailModal({
  exercise,
  onClose,
  onAddToSession,
}: {
  exercise: Exercise;
  onClose: () => void;
  onAddToSession: (ex: Exercise) => void;
}) {
  const [timerOpen, setTimerOpen] = useState(false);
  const details = exerciseDetails[Number(exercise.id)];
  const steps = details?.steps ?? [
    "Set up in the correct starting position for this exercise.",
    "Execute the movement with controlled, deliberate form.",
    "Breathe steadily — exhale during exertion, inhale on the way back.",
  ];
  const sets = details?.sets ?? 3;
  const reps = details?.reps ?? 10;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center"
        style={{
          maxWidth: "430px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full bg-card rounded-t-3xl pb-10 max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          data-ocid="exercise.modal"
        >
          {/* Header */}
          <div className="p-5 sticky top-0 bg-card z-10 border-b border-border flex items-start justify-between">
            <div>
              <div className="text-3xl mb-1">
                {MUSCLE_ICONS[exercise.muscleGroup] || "💪"}
              </div>
              <h2 className="text-xl font-display font-bold text-foreground">
                {exercise.name}
              </h2>
              <Badge
                className={`mt-1 ${MUSCLE_COLORS[exercise.muscleGroup] || "bg-gray-500/20 text-gray-400"}`}
              >
                {exercise.muscleGroup}
              </Badge>
            </div>
            <button
              type="button"
              data-ocid="exercise.close_button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground mt-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-5 flex flex-col gap-5">
            {/* Recommended sets/reps */}
            <div className="flex gap-3">
              <div className="flex-1 bg-muted rounded-xl p-3 text-center">
                <p className="text-2xl font-display font-bold text-foreground">
                  {sets}
                </p>
                <p className="text-xs text-muted-foreground">Sets</p>
              </div>
              <div className="flex-1 bg-muted rounded-xl p-3 text-center">
                <p className="text-2xl font-display font-bold text-foreground">
                  {reps === 1 ? "Timed" : reps}
                </p>
                <p className="text-xs text-muted-foreground">Reps</p>
              </div>
            </div>

            {/* Video placeholder */}
            <div
              className="rounded-2xl flex flex-col items-center justify-center gap-2 py-8"
              style={{ background: "oklch(0.13 0 0)" }}
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Play className="h-6 w-6 text-primary ml-0.5" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Video Coming Soon
              </p>
            </div>

            {/* Steps */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Step-by-Step Instructions
              </h3>
              <div className="flex flex-col gap-3">
                {steps.map((step, i) => (
                  <div
                    key={STEP_LABELS[i] ?? `step-${i}`}
                    className="flex gap-3"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-xs font-semibold text-primary mb-0.5">
                        Step {i + 1}: {STEP_LABELS[i] ?? ""}
                      </p>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rest Timer trigger */}
            <button
              type="button"
              onClick={() => setTimerOpen(true)}
              className="flex items-center gap-3 bg-muted rounded-xl p-3 hover:bg-muted/80 transition-colors text-left"
              data-ocid="exercise.button"
            >
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Rest Timer
                </p>
                <p className="text-xs text-muted-foreground">
                  60 second rest between sets
                </p>
              </div>
            </button>

            {/* Add to Session */}
            <Button
              data-ocid="exercise.primary_button"
              className="w-full h-12 rounded-xl font-bold gap-2"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.22 25), oklch(0.52 0.20 25))",
              }}
              onClick={() => {
                onAddToSession(exercise);
                onClose();
              }}
            >
              <Plus className="h-4 w-4" />
              Add to Session
            </Button>
          </div>
        </motion.div>
      </motion.div>

      <TimerSheet
        isOpen={timerOpen}
        duration={60}
        onComplete={() => setTimerOpen(false)}
        onSkip={() => setTimerOpen(false)}
      />
    </>
  );
}

export default function Workout() {
  const { identity, login } = useInternetIdentity();
  const { data: exercises = [], isLoading } = useExercises();
  const createSession = useCreateWorkoutSession();
  const addEntry = useAddWorkoutEntry();

  const [mode, setMode] = useState<"browse" | "active">("browse");
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<
    "all" | "beginner" | "intermediate" | "advanced"
  >("all");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );

  const [workingExercises, setWorkingExercises] = useState<WorkingExercise[]>(
    [],
  );
  const [elapsed, setElapsed] = useState(0);
  const [timerOpen, setTimerOpen] = useState(false);
  const timerDuration = 60;
  const [notes, setNotes] = useState("");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (mode === "active") {
      intervalRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mode]);

  const filteredExercises = exercises.filter((ex) => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchMuscle =
      muscleFilter === "all" || ex.muscleGroup === muscleFilter;
    const matchDifficulty =
      difficultyFilter === "all" ||
      DIFFICULTY_MUSCLE_MAP[difficultyFilter]?.has(ex.muscleGroup);
    return matchSearch && matchMuscle && matchDifficulty;
  });

  function addExerciseToWorkout(exercise: Exercise) {
    if (workingExercises.find((we) => we.exercise.id === exercise.id)) {
      toast.info(`${exercise.name} already added`);
      return;
    }
    setWorkingExercises((prev) => [
      ...prev,
      { exercise, sets: [{ weight: "", reps: "", done: false }] },
    ]);
    toast.success(`${exercise.name} added`);
  }

  function addSet(exerciseIdx: number) {
    setWorkingExercises((prev) =>
      prev.map((we, i) =>
        i === exerciseIdx
          ? { ...we, sets: [...we.sets, { weight: "", reps: "", done: false }] }
          : we,
      ),
    );
  }

  function updateSet(
    exerciseIdx: number,
    setIdx: number,
    field: "weight" | "reps",
    value: string,
  ) {
    setWorkingExercises((prev) =>
      prev.map((we, i) =>
        i === exerciseIdx
          ? {
              ...we,
              sets: we.sets.map((s, si) =>
                si === setIdx ? { ...s, [field]: value } : s,
              ),
            }
          : we,
      ),
    );
  }

  function logSet(exerciseIdx: number, setIdx: number) {
    setWorkingExercises((prev) =>
      prev.map((we, i) =>
        i === exerciseIdx
          ? {
              ...we,
              sets: we.sets.map((s, si) =>
                si === setIdx ? { ...s, done: true } : s,
              ),
            }
          : we,
      ),
    );
    setTimerOpen(true);
  }

  async function finishWorkout() {
    if (!identity) {
      login();
      return;
    }
    const sets = workingExercises.flatMap((we) =>
      we.sets
        .filter((s) => s.done && s.weight && s.reps)
        .map((s, si) => ({
          setNumber: BigInt(si + 1),
          weight: Number.parseFloat(s.weight) || 0,
          exerciseId: we.exercise.id,
          reps: BigInt(Number.parseInt(s.reps) || 0),
        })),
    );
    if (sets.length === 0) {
      toast.error("Log at least one set before finishing");
      return;
    }
    try {
      const sessionId = await createSession.mutateAsync({ notes, sets });
      const today = new Date().toISOString().split("T")[0];
      await addEntry.mutateAsync({ sessionId, date: today });
      toast.success("💪 Workout saved! Great job!");
      setMode("browse");
      setWorkingExercises([]);
      setNotes("");
    } catch {
      toast.error("Failed to save workout");
    }
  }

  return (
    <div className="min-h-full" data-ocid="workout.page">
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-foreground">
            {mode === "browse" ? "Exercises" : "Active Workout"}
          </h1>
          {mode === "browse" ? (
            identity ? (
              <Button
                data-ocid="workout.primary_button"
                size="sm"
                onClick={() => setMode("active")}
                className="rounded-xl gap-1 text-xs"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.22 25), oklch(0.52 0.20 25))",
                }}
              >
                <Plus className="h-3.5 w-3.5" /> Start Workout
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={login}
                variant="outline"
                className="rounded-xl text-xs border-primary text-primary"
              >
                Login
              </Button>
            )
          ) : (
            <div className="flex items-center gap-2 bg-card rounded-xl px-3 py-1.5 border border-border">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-mono font-bold text-foreground">
                {formatElapsed(elapsed)}
              </span>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === "browse" ? (
          <motion.div
            key="browse"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="px-4 flex flex-col gap-3 pb-4"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                data-ocid="workout.search_input"
                placeholder="Search exercises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-card border-border rounded-xl"
              />
            </div>

            {/* Difficulty Filter Tabs */}
            <div className="flex gap-2">
              {(["all", "beginner", "intermediate", "advanced"] as const).map(
                (d) => (
                  <button
                    key={d}
                    type="button"
                    data-ocid="workout.tab"
                    onClick={() => setDifficultyFilter(d)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                      difficultyFilter === d
                        ? d === "beginner"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : d === "intermediate"
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                            : d === "advanced"
                              ? "bg-primary/20 text-primary border border-primary/40"
                              : "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground border border-border"
                    }`}
                  >
                    {d === "all"
                      ? "All"
                      : d === "beginner"
                        ? "Beg"
                        : d === "intermediate"
                          ? "Int"
                          : "Adv"}
                  </button>
                ),
              )}
            </div>

            {/* Muscle Group Filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {MUSCLE_GROUPS.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  data-ocid="workout.tab"
                  onClick={() => setMuscleFilter(value)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    muscleFilter === value
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground border border-border hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div
                data-ocid="workout.loading_state"
                className="flex flex-col gap-3"
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-20 bg-card rounded-2xl animate-pulse border border-border"
                  />
                ))}
              </div>
            ) : filteredExercises.length === 0 ? (
              <div
                data-ocid="workout.empty_state"
                className="text-center py-12 text-muted-foreground"
              >
                <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No exercises found</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredExercises.map((ex, idx) => (
                  <motion.button
                    type="button"
                    key={ex.id.toString()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    data-ocid={`workout.item.${idx + 1}`}
                    onClick={() => setSelectedExercise(ex)}
                    className="bg-card rounded-2xl p-4 border border-border flex items-center gap-3 cursor-pointer hover:border-primary/40 transition-colors text-left w-full"
                  >
                    <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-xl flex-shrink-0">
                      {MUSCLE_ICONS[ex.muscleGroup] || "💪"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {ex.name}
                      </p>
                      <Badge
                        className={`text-[10px] mt-0.5 ${MUSCLE_COLORS[ex.muscleGroup] || ""}`}
                      >
                        {ex.muscleGroup}
                      </Badge>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground rotate-[-90deg] flex-shrink-0" />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-4 flex flex-col gap-4 pb-6"
          >
            <Input
              data-ocid="workout.textarea"
              placeholder="Workout notes (optional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-card border-border rounded-xl"
            />

            {workingExercises.length === 0 ? (
              <div
                data-ocid="workout.empty_state"
                className="bg-card rounded-2xl p-8 border border-border text-center"
              >
                <p className="text-muted-foreground text-sm">
                  Add exercises from the browser below
                </p>
                <Button
                  data-ocid="workout.secondary_button"
                  variant="ghost"
                  className="mt-3 text-primary text-sm"
                  onClick={() => {}}
                >
                  <ChevronDown className="h-4 w-4 mr-1" /> Browse Exercises
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {workingExercises.map((we, exIdx) => (
                  <div
                    key={we.exercise.id.toString()}
                    className="bg-card rounded-2xl border border-border overflow-hidden"
                    data-ocid={`workout.item.${exIdx + 1}`}
                  >
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {MUSCLE_ICONS[we.exercise.muscleGroup]}
                        </span>
                        <span className="font-semibold text-foreground">
                          {we.exercise.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        data-ocid="workout.delete_button"
                        onClick={() =>
                          setWorkingExercises((p) =>
                            p.filter((_, i) => i !== exIdx),
                          )
                        }
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="p-3 flex flex-col gap-2">
                      <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 px-1 pb-1">
                        <span className="text-[10px] text-muted-foreground w-8">
                          SET
                        </span>
                        <span className="text-[10px] text-muted-foreground text-center">
                          KG
                        </span>
                        <span className="text-[10px] text-muted-foreground text-center">
                          REPS
                        </span>
                        <span className="text-[10px] text-muted-foreground w-8" />
                      </div>
                      {we.sets.map((set, setIdx) => (
                        <div
                          key={`${we.exercise.id.toString()}-set-${setIdx}`}
                          className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center"
                        >
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            <span className="text-xs font-bold text-muted-foreground">
                              {setIdx + 1}
                            </span>
                          </div>
                          <input
                            type="number"
                            placeholder="0"
                            value={set.weight}
                            onChange={(e) =>
                              updateSet(exIdx, setIdx, "weight", e.target.value)
                            }
                            className="h-8 bg-muted rounded-lg text-center text-sm font-medium text-foreground border-0 outline-none w-full px-2"
                            style={{ fontSize: "16px" }}
                          />
                          <input
                            type="number"
                            placeholder="0"
                            value={set.reps}
                            onChange={(e) =>
                              updateSet(exIdx, setIdx, "reps", e.target.value)
                            }
                            className="h-8 bg-muted rounded-lg text-center text-sm font-medium text-foreground border-0 outline-none w-full px-2"
                            style={{ fontSize: "16px" }}
                          />
                          <button
                            type="button"
                            data-ocid="workout.toggle"
                            onClick={() => logSet(exIdx, setIdx)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                              set.done
                                ? "bg-accent text-accent-foreground"
                                : "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"
                            }`}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        data-ocid="workout.secondary_button"
                        onClick={() => addSet(exIdx)}
                        className="mt-1 w-full py-2 rounded-xl border border-dashed border-border text-muted-foreground text-xs hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Set
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Add Exercise
              </p>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  data-ocid="workout.search_input"
                  placeholder="Search exercises..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-card border-border rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto scrollbar-hide">
                {filteredExercises.slice(0, 20).map((ex) => (
                  <button
                    key={ex.id.toString()}
                    type="button"
                    data-ocid="workout.button"
                    onClick={() => addExerciseToWorkout(ex)}
                    className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/40 text-left transition-colors"
                  >
                    <span className="text-lg">
                      {MUSCLE_ICONS[ex.muscleGroup]}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {ex.name}
                    </span>
                    <Badge
                      className={`ml-auto text-[10px] ${MUSCLE_COLORS[ex.muscleGroup] || ""}`}
                    >
                      {ex.muscleGroup}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                data-ocid="workout.cancel_button"
                variant="outline"
                className="flex-1 border-border rounded-xl"
                onClick={() => {
                  setMode("browse");
                  setWorkingExercises([]);
                }}
              >
                Cancel
              </Button>
              <Button
                data-ocid="workout.submit_button"
                className="flex-1 rounded-xl font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.22 25), oklch(0.52 0.20 25))",
                }}
                onClick={finishWorkout}
                disabled={createSession.isPending || addEntry.isPending}
              >
                {createSession.isPending ? "Saving..." : "Finish Workout"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedExercise && (
          <ExerciseDetailModal
            exercise={selectedExercise}
            onClose={() => setSelectedExercise(null)}
            onAddToSession={(ex) => {
              addExerciseToWorkout(ex);
              setMode("active");
            }}
          />
        )}
      </AnimatePresence>

      <TimerSheet
        isOpen={timerOpen}
        duration={timerDuration}
        onComplete={() => setTimerOpen(false)}
        onSkip={() => setTimerOpen(false)}
      />
    </div>
  );
}
