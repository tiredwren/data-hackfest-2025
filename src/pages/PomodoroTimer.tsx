import { useEffect, useRef, useState } from "react";
import { Pause, Play, RefreshCw, Timer } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { App } from "@capacitor/app";
import { LocalNotifications } from "@capacitor/local-notifications";

export default function PomodoroTimer() {
  const [duration, setDuration] = useState(25 * 60);
  const [breakDuration, setBreakDuration] = useState(5 * 60);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const cycles = 3;
  const totalTime = (duration + breakDuration) * cycles;
  const cycleLength = duration + breakDuration;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastModeRef = useRef<"focus" | "break">("focus");

  const presets = [
    { label: "test/test", focus: 5, break: 3 },
    { label: "25/5", focus: 25 * 60, break: 5 * 60 },
    { label: "50/10", focus: 50 * 60, break: 10 * 60 },
  ];

  useEffect(() => {
    LocalNotifications.requestPermissions();
  }, []);

  const dingSound = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    dingSound.current = new Audio("/sounds/ding.mp3");
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev + 1 >= totalTime) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            toast({ title: "Pomodoro Complete", description: "3 cycles done!" });
            return totalTime;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }

    return () => clearInterval(intervalRef.current!);
  }, [isRunning, totalTime]);

  // Calculate current phase and time left
  const currentCycleProgress = elapsed % cycleLength;
  const mode = currentCycleProgress < duration ? "focus" : "break";
  const timeLeft =
    mode === "focus"
      ? duration - currentCycleProgress
      : breakDuration - (currentCycleProgress - duration);

  const cycleNumber = Math.floor(elapsed / cycleLength) + 1;
  const progress = (elapsed / totalTime) * 100;

  // Detect phase change → play ding + 1-sec pause
  useEffect(() => {
    if (elapsed === 0) return;

    const lastMode = lastModeRef.current;
    if (lastMode !== mode) {
      lastModeRef.current = mode;

      if (dingSound.current) {
        dingSound.current.currentTime = 0;
        dingSound.current.play();
      }

      toast({
        title: mode === "focus" ? "Focus Time" : "Break Time",
        description: mode === "focus" ? "Back to work!" : "Take a break!",
      });

      // Pause for 1 sec then resume
      setIsRunning(false);
      setTimeout(() => setIsRunning(true), 1000);
    }
  }, [mode, elapsed]);

  // Resume from background
  useEffect(() => {
    let lastBackgroundTime: number | null = null;

    App.addListener("pause", () => {
      if (isRunning) lastBackgroundTime = Date.now();
    });

    App.addListener("resume", () => {
      if (isRunning && lastBackgroundTime) {
        const elapsedSincePause = Math.floor(
          (Date.now() - lastBackgroundTime) / 1000
        );
        setElapsed((prev) => {
          const newElapsed = prev + elapsedSincePause;
          return newElapsed >= totalTime ? totalTime : newElapsed;
        });
      }
    });

    return () => {
      App.removeAllListeners();
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  const handlePresetSelect = (focus: number, breakT: number) => {
    setDuration(focus);
    setBreakDuration(breakT);
    setElapsed(0);
    setIsRunning(false);
  };

  const progressColor = mode === "focus" ? "bg-green-500" : "bg-purple-400";

  return (
    <div className="min-h-screen p-6 bg-background text-foreground flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Pomodoro Timer</h1>

      <div className="flex gap-2 mb-6">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            onClick={() => handlePresetSelect(preset.focus, preset.break)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <Card className="w-full max-w-sm">
        <CardContent className="py-10 flex flex-col items-center">
          <Timer className="h-8 w-8 mb-2" />
          <p className="text-4xl font-mono mb-1">{formatTime(timeLeft)}</p>
          <p className="text-muted-foreground mb-4">
            {mode === "focus" ? "Focus time" : "Break time"} (Cycle {cycleNumber}
            /3)
          </p>

          <div className="w-full h-2 rounded-full bg-gray-200 mb-4 overflow-hidden">
            <div
              className={`h-2 ${progressColor} transition-all`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setIsRunning(!isRunning)}>
              {isRunning ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isRunning ? "Pause" : "Start"}
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePresetSelect(duration, breakDuration)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
