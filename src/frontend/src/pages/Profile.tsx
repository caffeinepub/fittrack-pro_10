import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Loader2, LogIn, LogOut, Save, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FitnessGoal } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveProfile, useUserProfile } from "../hooks/useQueries";

const GOAL_OPTIONS = [
  { value: FitnessGoal.fatLoss, label: "Fat Loss" },
  { value: FitnessGoal.muscleGain, label: "Muscle Gain" },
  { value: FitnessGoal.endurance, label: "Endurance" },
  { value: FitnessGoal.generalFitness, label: "General Fitness" },
];

export default function Profile() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: profile, isLoading } = useUserProfile();
  const saveProfile = useSaveProfile();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState<FitnessGoal>(FitnessGoal.generalFitness);
  const [reminderTime, setReminderTime] = useState(
    () => localStorage.getItem("fittrack_reminder") || "",
  );

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setAge(profile.age ? profile.age.toString() : "");
      setWeight(profile.weight ? profile.weight.toString() : "");
      setHeight(profile.height ? profile.height.toString() : "");
      setGoal(profile.goal || FitnessGoal.generalFitness);
    }
  }, [profile]);

  async function handleSave() {
    if (!identity) {
      login();
      return;
    }
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        age: BigInt(Number.parseInt(age) || 0),
        weight: Number.parseFloat(weight) || 0,
        height: Number.parseFloat(height) || 0,
        goal,
      });
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile");
    }
  }

  function handleSetReminder() {
    if (!reminderTime) {
      toast.error("Select a time first");
      return;
    }
    if (!window.Notification) {
      toast.error("Notifications not supported");
      return;
    }
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        localStorage.setItem("fittrack_reminder", reminderTime);
        toast.success(`Reminder set for ${reminderTime}`);
        scheduleReminder(reminderTime);
      } else {
        toast.error("Notification permission denied");
      }
    });
  }

  function scheduleReminder(time: string) {
    const [h, m] = time.split(":").map(Number);
    const now = new Date();
    const target = new Date(now);
    target.setHours(h, m, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const diff = target.getTime() - now.getTime();
    setTimeout(() => {
      new Notification("FitTrack Pro", {
        body: "Time for your workout! 💪",
        icon: "/favicon.ico",
      });
    }, diff);
  }

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "FP";

  if (!identity) {
    return (
      <div className="min-h-full flex flex-col" data-ocid="profile.page">
        <div className="px-4 pt-12 pb-6">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Profile
          </h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">
              Welcome to FitTrack Pro
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Login to save your profile and track progress
            </p>
          </div>
          <Button
            data-ocid="profile.primary_button"
            onClick={login}
            disabled={isLoggingIn}
            className="w-full max-w-xs h-12 rounded-xl font-semibold gap-2"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.22 264), oklch(0.55 0.20 264))",
            }}
          >
            {isLoggingIn ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {isLoggingIn ? "Logging in..." : "Login"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full" data-ocid="profile.page">
      <div className="px-4 pt-12 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Profile
        </h1>
        <button
          type="button"
          data-ocid="profile.secondary_button"
          onClick={clear}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-destructive transition-colors text-sm"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>

      <div className="px-4 flex flex-col gap-5 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center pt-2 pb-4"
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-display font-bold text-primary-foreground glow-primary"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.22 264), oklch(0.50 0.20 264))",
            }}
          >
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              initials
            )}
          </div>
          {profile?.name && (
            <p className="text-lg font-display font-semibold text-foreground mt-3">
              {profile.name}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            {identity.getPrincipal().toString().slice(0, 20)}...
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl p-4 border border-border flex flex-col gap-4"
        >
          <h2 className="font-display font-semibold text-foreground">
            Personal Info
          </h2>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Name
            </Label>
            <Input
              data-ocid="profile.input"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-muted border-0 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Age
              </Label>
              <Input
                data-ocid="profile.input"
                type="number"
                placeholder="25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="bg-muted border-0 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Weight
              </Label>
              <Input
                data-ocid="profile.input"
                type="number"
                placeholder="75 kg"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="bg-muted border-0 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Height
              </Label>
              <Input
                data-ocid="profile.input"
                type="number"
                placeholder="175 cm"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="bg-muted border-0 rounded-xl"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Fitness Goal
            </Label>
            <Select
              value={goal}
              onValueChange={(v) => setGoal(v as FitnessGoal)}
            >
              <SelectTrigger
                data-ocid="profile.select"
                className="bg-muted border-0 rounded-xl"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GOAL_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            data-ocid="profile.save_button"
            onClick={handleSave}
            disabled={saveProfile.isPending}
            className="w-full rounded-xl h-11 font-semibold gap-2 mt-1"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.22 264), oklch(0.55 0.20 264))",
            }}
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Profile
              </>
            )}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-4 border border-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-fitness-orange" />
            <h2 className="font-display font-semibold text-foreground">
              Workout Reminder
            </h2>
          </div>
          <div className="flex gap-2">
            <Input
              data-ocid="profile.input"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="bg-muted border-0 rounded-xl flex-1"
            />
            <Button
              data-ocid="profile.secondary_button"
              onClick={handleSetReminder}
              variant="outline"
              className="rounded-xl border-border"
            >
              Set
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            You'll get a daily reminder at the selected time
          </p>
        </motion.div>

        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground/40">
            FitTrack Pro v1.0.0
          </p>
          <p className="text-xs text-muted-foreground/30 mt-1">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
