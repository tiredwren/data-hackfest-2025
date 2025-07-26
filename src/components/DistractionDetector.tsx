import { useEffect, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DistractionAlert } from "./DistractionAlert";
import { Button } from "@/components/ui/button";

// Load Gemini instance
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Static mock input for now — replace with live signals later
const usageData = {
  timeOfDay: "14:45",
  appSequence: ["Slack", "Instagram", "YouTube"],
  notificationCount: 10,
  screenActivity: ["active", "idle", "switching"]
};

// Traditional rule-based distraction score
function getDistractionScore(appSwitches: number, focusTime: number, screenTime: number): number {
  if (screenTime === 0) return 0;
  const distractionRatio = appSwitches / screenTime;
  const focusRatio = focusTime / screenTime;
  return distractionRatio > 0.05 && focusRatio < 0.5 ? 0.8 : 0.2;
}

// Ask Gemini for a distraction probability score (0–1)
async function fetchGeminiScore(): Promise<number> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `
    You're an AI assistant detecting user distraction.

    Based on:
      - App usage: ${usageData.appSequence.join(", ")}
      - Time of day: ${usageData.timeOfDay}
      - Notifications: ${usageData.notificationCount}
      - Screen activity: ${usageData.screenActivity.join(", ")}

    Respond ONLY with a number from 0 to 1 (higher = more distracted).
  `;
  const res = await model.generateContent(prompt);
  const scoreText = await res.response.text();
  const parsed = parseFloat(scoreText.trim());
  return isNaN(parsed) ? 0 : Math.min(Math.max(parsed, 0), 1); // Clamp between 0–1
}

interface DistractionDetectorProps {
  appSwitches: number;
  focusTime: number;
  screenTime: number;
}

export function DistractionDetector({ appSwitches, focusTime, screenTime }: DistractionDetectorProps) {
  const [isDistracted, setIsDistracted] = useState(false);
  const [geminiScore, setGeminiScore] = useState<number | null>(null);

  // Combine logic: either traditional OR Gemini score triggers the alert
  useEffect(() => {
    const checkDistraction = async () => {
      const localScore = getDistractionScore(appSwitches, focusTime, screenTime);
      let shouldAlert = localScore > 0.6;

      try {
        const aiScore = await fetchGeminiScore();
        setGeminiScore(aiScore);
        if (aiScore > 0.6) {
          shouldAlert = true;
        }
      } catch (err) {
        console.error("Gemini error:", err);
      }

      setIsDistracted(shouldAlert);
    };

    checkDistraction();
  }, [appSwitches, focusTime, screenTime]);

  if (!isDistracted) return null;

  return (
    <DistractionAlert
      message={
        geminiScore !== null
          ? `Gemini score: ${geminiScore.toFixed(2)}`
          : "Distraction detected"
      }
      appName={usageData.appSequence[1] || "an app"}
      onTakeBreak={() => {
        console.log("User started a break.");
        setIsDistracted(false);
      }}
      onDismiss={() => setIsDistracted(false)}
    >
      <div className="flex gap-2 mt-2">
        <Button
          variant="default"
          onClick={() => {
            console.log("Start Focus Mode");
            setIsDistracted(false);
          }}
        >
          Start Focus Mode
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            console.log("Maybe later");
            setIsDistracted(false);
          }}
        >
          Maybe Later
        </Button>
      </div>
    </DistractionAlert>
  );
}

export interface DistractionAlertProps {
  message: string;
  appName: string;
  onTakeBreak: () => void;
  onDismiss: () => void;
  children?: React.ReactNode;
}
