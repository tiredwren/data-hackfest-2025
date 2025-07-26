import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import React from "react";

export interface DistractionAlertProps {
  message: string;
  appName: string;
  onTakeBreak: () => void;
  onDismiss: () => void;
  children?: React.ReactNode;
}

export function DistractionAlert({
  message,
  appName,
  onTakeBreak,
  onDismiss,
  children
}: DistractionAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  return (
    <Alert className="border-warning bg-warning/10 mb-4">
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <span className="font-medium text-warning-foreground">Distraction detected:</span>{" "}
          <span className="text-foreground">{message} in {appName}</span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onTakeBreak}
            className="text-warning border-warning hover:bg-warning/20"
          >
            Take Break
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDismiss}
            className="h-auto p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
      {children}
    </Alert>
  );
}