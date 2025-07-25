import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Smartphone, Zap } from "lucide-react";

interface FocusCardProps {
  title: string;
  value: string;
  description: string;
  progress?: number;
  variant: "focus" | "warning" | "calm";
  icon: React.ReactNode;
}

export function FocusCard({ title, value, description, progress, variant, icon }: FocusCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "focus":
        return "border-focus bg-focus/5";
      case "warning":
        return "border-warning bg-warning/5";
      case "calm":
        return "border-calm bg-calm/5";
      default:
        return "";
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case "focus":
        return "text-focus";
      case "warning":
        return "text-warning";
      case "calm":
        return "text-calm";
      default:
        return "";
    }
  };

  return (
    <Card className={`border-2 ${getVariantStyles()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={getIconStyles()}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {progress !== undefined && (
          <Progress value={progress} className="mt-3 h-2" />
        )}
      </CardContent>
    </Card>
  );
}