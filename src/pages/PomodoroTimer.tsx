import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pause, Play, RefreshCw, Timer } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { App } from "@capacitor/app";
import { LocalNotifications } from "@capacitor/local-notifications";

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

export default function PomodoroTimer() {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(25 * 60); // focus time in seconds
  const [breakDuration, setBreakDuration] = useState(5 * 60);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);


  const [customFocus, setCustomFocus] = useState("25");
  const [customBreak, setCustomBreak] = useState("5");
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);

  const cycles = 3;
  const totalTime = (duration + breakDuration) * cycles;
  const cycleLength = duration + breakDuration;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastModeRef = useRef<"focus" | "break">("focus");

  const presets = [
    { label: "0.2/0.05", focus: 5, break: 3 },
    { label: "25/5", focus: 25 * 60, break: 5 * 60 },
    { label: "50/10", focus: 50 * 60, break: 10 * 60 },
  ];

  // Initialize audio element
  useEffect(() => {
    // Create a simple ding sound using Web Audio API
    const createDingSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // High frequency for ding sound
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };

    audioRef.current = { play: createDingSound } as any;
  }, []);

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
            // Play ding sound when session ends
            if (audioRef.current) {
              try {
                audioRef.current.play();
              } catch (error) {
                console.warn("Could not play ding sound:", error);
              }
            }

            if (mode === "focus") {
              setMode("break");
              setTimeLeft(breakDuration);
            } else {
              setMode("focus");
              setTimeLeft(duration);
            }
            return 0;
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


  const handleCustomSubmit = () => {
    const focus = parseInt(customFocus || "25", 10);
    const breakT = parseInt(customBreak || "5", 10);
    handlePresetSelect(focus * 60, breakT * 60);
    // Start the timer after setting custom time
    setIsRunning(true);
    // Close the dialog
    setIsCustomDialogOpen(false);
  };






  return (
    <div className="min-h-screen p-6 bg-background text-foreground flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Pomodoro Timer</h1>

      {/* Preset + Custom Time Tabs */}
      <Tabs defaultValue="presets" className="w-full max-w-md mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent
          value="presets"
          className="flex gap-2 justify-center mt-4"
        >
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
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Custom Time</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm">Focus (minutes)</label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={customFocus}
                    onChange={(e) => setCustomFocus(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm">Break (minutes)</label>
                  <Input
                    type="number"
                    inputMode="numeric"
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

      {/* Timer Card */}
      <Card className="w-full max-w-sm">
        <CardContent className="py-10 flex flex-col items-center">
          <Timer className="h-8 w-8 mb-2" />
          <p className="text-4xl font-mono mb-1">{formatTime(timeLeft)}</p>
          <p className="text-muted-foreground mb-4">
            {mode === "focus" ? "Focus time" : "Break time"}
          </p>

          {/* Progress */}
          <Progress className="w-full mb-4" value={progress} />

          {/* Controls */}
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
