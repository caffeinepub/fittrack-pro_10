import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Flame, Loader2, Scale, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useExerciseProgress,
  useExercises,
  useLogWeight,
  useWeightHistory,
  useWorkoutHistory,
} from "../hooks/useQueries";

function SVGLineChart({
  data,
  color,
  unit,
  chartTitle,
}: {
  data: Array<{ date: string; value: number }>;
  color: string;
  unit: string;
  chartTitle: string;
}) {
  const width = 340;
  const height = 120;
  const padX = 10;
  const padY = 12;

  if (data.length < 2) {
    return (
      <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
        {data.length === 1
          ? "Only 1 data point — log more to see trend"
          : "No data yet — start logging!"}
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const pts = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * (width - padX * 2),
    y: padY + (1 - (d.value - minVal) / range) * (height - padY * 2),
    value: d.value,
    date: d.date,
  }));

  const pathD = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;
  const gradId = `grad-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height: "120px" }}
        role="img"
        aria-label={chartTitle}
      >
        <title>{chartTitle}</title>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#${gradId})`} />
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p) => (
          <circle key={p.date} cx={p.x} cy={p.y} r="3.5" fill={color} />
        ))}
      </svg>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-muted-foreground">
          {data[0]?.date.slice(5)}
        </span>
        <span className="text-xs font-semibold text-foreground">
          Latest: {data[data.length - 1]?.value} {unit}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {data[data.length - 1]?.date.slice(5)}
        </span>
      </div>
    </div>
  );
}

export default function Progress() {
  const { identity, login } = useInternetIdentity();
  const { data: weightHistory = [], isLoading: weightLoading } =
    useWeightHistory();
  const logWeight = useLogWeight();
  const { data: exercises = [] } = useExercises();
  const { data: workoutHistory = [] } = useWorkoutHistory();
  const [weightInput, setWeightInput] = useState("");
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const exerciseId = selectedExerciseId ? BigInt(selectedExerciseId) : null;
  const { data: exProgress = [], isLoading: exLoading } =
    useExerciseProgress(exerciseId);

  const weightData = useMemo(
    () =>
      [...weightHistory]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, value]) => ({ date, value })),
    [weightHistory],
  );

  const exProgressData = useMemo(
    () =>
      [...exProgress]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, , value]) => ({ date, value })),
    [exProgress],
  );

  // Calories estimate: workouts this week × avg sets × 5 kcal per set
  const weeklyCalories = useMemo(() => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split("T")[0];
    const weekWorkouts = workoutHistory.filter((e) => e.date >= weekAgoStr);
    // estimate 4 sets per workout on average
    return weekWorkouts.length * 4 * 5;
  }, [workoutHistory]);

  const workoutsThisWeek = useMemo(() => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split("T")[0];
    return workoutHistory.filter((e) => e.date >= weekAgoStr).length;
  }, [workoutHistory]);

  async function handleLogWeight() {
    if (!identity) {
      login();
      return;
    }
    const w = Number.parseFloat(weightInput);
    if (!w || w <= 0) {
      toast.error("Enter a valid weight");
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    try {
      await logWeight.mutateAsync({ date: today, weight: w });
      toast.success("Weight logged!");
      setWeightInput("");
    } catch {
      toast.error("Failed to log weight");
    }
  }

  return (
    <div className="min-h-full" data-ocid="progress.page">
      <div className="px-4 pt-12 pb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Progress
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your body and strength gains
        </p>
      </div>

      <div className="px-4 flex flex-col gap-5 pb-6">
        {/* Calories Burned Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 border border-primary/30 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.14 0.03 25), oklch(0.10 0.01 25))",
          }}
          data-ocid="progress.card"
        >
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-5 w-5 text-primary" />
            <h2 className="font-display font-semibold text-foreground">
              Weekly Calories Burned
            </h2>
          </div>
          <div className="flex items-end gap-3">
            <div>
              <span className="text-4xl font-display font-black text-primary">
                {weeklyCalories.toLocaleString()}
              </span>
              <span className="text-lg text-muted-foreground ml-2">kcal</span>
            </div>
            <div className="pb-1">
              <span className="text-xs text-muted-foreground">
                ~{workoutsThisWeek} workouts this week
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Estimate based on logged workout sessions × average sets
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl p-4 border border-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <Scale className="h-5 w-5 text-primary" />
            <h2 className="font-display font-semibold text-foreground">
              Body Weight
            </h2>
          </div>

          {weightLoading ? (
            <div
              data-ocid="progress.loading_state"
              className="h-32 flex items-center justify-center"
            >
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <SVGLineChart
              data={weightData}
              color="oklch(0.61 0.21 25)"
              unit="kg"
              chartTitle="Body weight history"
            />
          )}

          <div className="flex gap-2 mt-4">
            <Input
              data-ocid="progress.input"
              type="number"
              placeholder="Weight (kg)"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="bg-muted border-0 rounded-xl flex-1"
            />
            <Button
              data-ocid="progress.submit_button"
              onClick={handleLogWeight}
              disabled={logWeight.isPending}
              className="rounded-xl px-5"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.22 25), oklch(0.52 0.20 25))",
              }}
            >
              {logWeight.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Log"
              )}
            </Button>
          </div>
          {!identity && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              <button
                type="button"
                onClick={login}
                className="text-primary underline"
              >
                Login
              </button>{" "}
              to log weight
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-4 border border-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-accent" />
            <h2 className="font-display font-semibold text-foreground">
              Strength Progress
            </h2>
          </div>

          <Select
            value={selectedExerciseId}
            onValueChange={setSelectedExerciseId}
          >
            <SelectTrigger
              data-ocid="progress.select"
              className="bg-muted border-0 rounded-xl mb-4"
            >
              <SelectValue placeholder="Select an exercise..." />
            </SelectTrigger>
            <SelectContent>
              {exercises.map((ex) => (
                <SelectItem key={ex.id.toString()} value={ex.id.toString()}>
                  {ex.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedExerciseId &&
            (exLoading ? (
              <div
                data-ocid="progress.loading_state"
                className="h-32 flex items-center justify-center"
              >
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
              </div>
            ) : (
              <SVGLineChart
                data={exProgressData}
                color="oklch(0.73 0.20 142)"
                unit="kg"
                chartTitle="Exercise strength progress"
              />
            ))}

          {!selectedExerciseId && (
            <div
              data-ocid="progress.empty_state"
              className="h-24 flex items-center justify-center text-muted-foreground text-sm"
            >
              Select an exercise to view progress
            </div>
          )}
        </motion.div>

        {weightData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
            {[
              {
                label: "Starting Weight",
                value: `${weightData[0]?.value} kg`,
                sub: weightData[0]?.date,
              },
              {
                label: "Current Weight",
                value: `${weightData[weightData.length - 1]?.value} kg`,
                sub: "Latest entry",
              },
            ].map(({ label, value, sub }) => (
              <div
                key={label}
                className="bg-card rounded-2xl p-4 border border-border"
              >
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="text-xl font-display font-bold text-foreground">
                  {value}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
