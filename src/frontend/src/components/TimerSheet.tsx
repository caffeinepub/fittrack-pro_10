import { Button } from "@/components/ui/button";
import { SkipForward, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface TimerSheetProps {
  isOpen: boolean;
  duration: number;
  onComplete: () => void;
  onSkip: () => void;
}

const DURATION_OPTIONS = [30, 60, 90, 120];

export default function TimerSheet({
  isOpen,
  duration,
  onComplete,
  onSkip,
}: TimerSheetProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [selectedDuration, setSelectedDuration] = useState(duration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(selectedDuration);
    }
  }, [isOpen, selectedDuration]);

  useEffect(() => {
    if (!isOpen) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen, onComplete]);

  const progress = timeLeft / selectedDuration;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - progress);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center"
          style={{
            maxWidth: "430px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full bg-card rounded-t-3xl p-6 pb-10"
            data-ocid="timer.panel"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-semibold text-foreground">
                Rest Timer
              </h3>
              <button
                type="button"
                data-ocid="timer.close_button"
                onClick={onSkip}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <svg
                  width="130"
                  height="130"
                  className="-rotate-90"
                  aria-hidden="true"
                >
                  <title>Rest timer progress</title>
                  <circle
                    cx="65"
                    cy="65"
                    r="54"
                    fill="none"
                    stroke="oklch(0.20 0 0)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="65"
                    cy="65"
                    r="54"
                    fill="none"
                    stroke="oklch(0.61 0.21 264)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-display font-bold text-foreground">
                    {minutes > 0
                      ? `${minutes}:${seconds.toString().padStart(2, "0")}`
                      : seconds}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    data-ocid="timer.toggle"
                    onClick={() => {
                      setSelectedDuration(d);
                      setTimeLeft(d);
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedDuration === d
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>

              <Button
                type="button"
                data-ocid="timer.cancel_button"
                onClick={onSkip}
                variant="outline"
                className="w-full gap-2 border-border"
              >
                <SkipForward className="h-4 w-4" />
                Skip Rest
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
