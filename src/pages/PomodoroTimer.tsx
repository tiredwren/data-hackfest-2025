import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pause, Play, RefreshCw, Timer } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { App } from "@capacitor/app";
import { LocalNotifications } from "@capacitor/local-notifications";

export default function PomodoroTimer() {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(25 * 60);
  const [breakDuration, setBreakDuration] = useState(5 * 60);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
  const [customFocus, setCustomFocus] = useState("25");
  const [customBreak, setCustomBreak] = useState("5");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const presets = [
    { label: "25/5", focus: 25 * 60, break: 5 * 60 },
    { label: "50/10", focus: 50 * 60, break: 10 * 60 },
  ];

  useEffect(() => {
    LocalNotifications.requestPermissions();
  }, []);

  useEffect(() => {
    if (isRunning) {
      setStartTimestamp(Date.now());
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            if (mode === "focus") {
              setMode("break");
              setTimeLeft(breakDuration);
            } else {
              setMode("focus");
              setTimeLeft(duration);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      LocalNotifications.schedule({
        notifications: [
          {
            title: mode === "focus" ? "Focus Complete" : "Break Over",
            body: mode === "focus"
              ? "Time for a break!"
              : "Time to focus again!",
            id: 1,
             schedule: { at: new Date(Date.now() + (mode === "focus" ? duration : breakDuration) * 1000) },
          },
        ],
      });

      toast({
        title: "Timer Started",
        description: mode === "focus" ? "Focus session running" : "Break time",
      });
    } else {
      clearInterval(intervalRef.current!);
      LocalNotifications.cancel({ notifications: [{ id: 1 }] });

      toast({
        title: "Timer Paused",
        description: "Timer is stopped",
      });
    }

    return () => clearInterval(intervalRef.current!);
  }, [isRunning, mode, duration, breakDuration]);

  useEffect(() => {
    const onAppResume = () => {
      if (isRunning && startTimestamp) {
        const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
        const newTimeLeft = timeLeft - elapsed;

        if (newTimeLeft <= 0) {
          const nextMode = mode === "focus" ? "break" : "focus";
          const newDuration = nextMode === "focus" ? duration : breakDuration;
          setMode(nextMode);
          setTimeLeft(newDuration);
          setIsRunning(false);

          toast({
            title: "Timer Complete",
            description:
              mode === "focus" ? "Focus session done!" : "Break finished!",
          });
        } else {
          setTimeLeft(newTimeLeft);
        }
      }
    };

    App.addListener("resume", onAppResume);
    return () => {
      App.removeAllListeners();
    };
  }, [isRunning, startTimestamp, timeLeft, mode, duration, breakDuration]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  const notifyDistraction = async (event: string, reason: string) => {
    toast({
      title: "Distraction Detected",
      description: reason,
    });

    try {
      await fetch("http://localhost:5000/api/distractions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "test-user-123",
          event,
          reason,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      toast({
        title: "Failed to Log Distraction",
        description: "Could not connect to server",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        notifyDistraction("tab_hidden", "Tab was hidden or switched");
      }
    };

    const handleWindowBlur = () => {
      notifyDistraction("window_blur", "Window lost focus");
    };

    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handlePresetSelect = (focus: number, breakT: number) => {
    setDuration(focus);
    setBreakDuration(breakT);
    setTimeLeft(focus);
    setMode("focus");
    setIsRunning(false);

    toast({
      title: "Preset Selected",
      description: `Focus: ${focus / 60}m | Break: ${breakT / 60}m`,
    });
  };

  const handleCustomSubmit = () => {
    const focus = parseInt(customFocus || "25", 10);
    const breakT = parseInt(customBreak || "5", 10);
    handlePresetSelect(focus * 60, breakT * 60);
  };

  const progress =
    mode === "focus"
      ? ((duration - timeLeft) / duration) * 100
      : ((breakDuration - timeLeft) / breakDuration) * 100;

  return (
    <div className="min-h-screen p-6 bg-background text-foreground flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Pomodoro Timer</h1>

      <Tabs defaultValue="presets" className="w-full max-w-md mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="flex gap-2 justify-center mt-4">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              onClick={() => handlePresetSelect(preset.focus, preset.break)}
            >
              {preset.label}
            </Button>
          ))}
        </TabsContent>

        <TabsContent value="custom" className="mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                Set Custom Time
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Custom Time</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm">Focus (minutes)</label>
                  <Input
                    type="number"
                    value={customFocus}
                    onChange={(e) => setCustomFocus(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm">Break (minutes)</label>
                  <Input
                    type="number"
                    value={customBreak}
                    onChange={(e) => setCustomBreak(e.target.value)}
                  />
                </div>
                <Button onClick={handleCustomSubmit} className="w-full">
                  Save & Start
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>

      <Card className="w-full max-w-sm">
        <CardContent className="py-10 flex flex-col items-center">
          <Timer className="h-8 w-8 mb-2" />
          <p className="text-4xl font-mono mb-1">{formatTime(timeLeft)}</p>
          <p className="text-muted-foreground mb-4">
            {mode === "focus" ? "Focus time" : "Break time"}
          </p>

          <Progress className="w-full mb-4" value={progress} />

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
