import { FocusCard } from "@/components/FocusCard";
import { AppUsageChart } from "@/components/AppUsageChart";
import { DistractionAlert } from "@/components/DistractionAlert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Smartphone, Zap, Target, Settings, RefreshCw, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useActivityTracking } from "@/hooks/useActivityTracking";
import { useRealUsageStats } from "@/hooks/useRealUsageStats";
import { useNotifications } from "@/hooks/useNotifications";
import { geminiService } from "@/services/geminiService";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const { requestNotificationPermission } = useNotifications();
  
  const { 
    currentFocusSession, 
    startFocusSession, 
    endFocusSession,
  } = useActivityTracking();
  
  const today = new Date().toISOString().split('T')[0];
  const { stats, isLoading, error, refetch } = useRealUsageStats({
    startDate: today,
    endDate: today
  });
  
  const [focusSessionRunning, setFocusSessionRunning] = useState(false);
  const [focusRemaining, setFocusRemaining] = useState<number>(0);
  const [aiInsights, setAiInsights] = useState<string>("");

  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  useEffect(() => {
    requestNotificationPermission();

    const focusState = localStorage.getItem("focusSession");
    if (focusState) {
      const parsed = JSON.parse(focusState);
      const now = Date.now();
      const remaining = parsed.endTime - now;
      if (remaining > 0) {
        setFocusSessionRunning(true);
        setFocusRemaining(remaining);
      } else {
        localStorage.removeItem("focusSession");
      }
    }
  }, []);

  useEffect(() => {
    let timer: any;
    if (focusSessionRunning) {
      timer = setInterval(() => {
        setFocusRemaining((prev) => {
          if (prev <= 1000) {
            setFocusSessionRunning(false);
            localStorage.removeItem("focusSession");
            clearInterval(timer);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [focusSessionRunning]);

  const handleRefresh = async () => {
    await refetch();
    toast.success("Data refreshed!");
  };

  const handleStartFocusSession = async () => {
    const sessionId = await startFocusSession();
    if (sessionId) {
      toast.success("Focus session started! Stay concentrated.");
    }
    navigate('/pomodoro');
  };

  const generateAIInsights = async () => {
    if (!stats) return;

    setIsGeneratingInsights(true);
    try {
      const insights = await geminiService.analyzeUsagePatterns(stats);
      setAiInsights(insights);
      toast.success("AI insights generated!");
    } catch (error) {
      toast.error("Failed to generate AI insights");
    } finally {
      setIsGeneratingInsights(false);
    }
  };



  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clarity</h1>
          <p className="text-muted-foreground">Your mindful usage companion</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Focus Timer Banner */}
      {focusSessionRunning && (
        <Card className="border-focus bg-focus/10 text-focus font-semibold mb-6">
          <CardContent className="py-4 text-center">
            Focus session running: {formatTime(focusRemaining)} left
          </CardContent>
        </Card>
      )}

      {/* Current Focus Session Banner */}
      {currentFocusSession && (
        <Card className="border-focus bg-focus/10 text-focus font-semibold mb-6">
          <CardContent className="py-4 text-center">
            🎯 Focus session active - Stay on track!
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-warning bg-warning/5 mb-6">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-warning">
                <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
              </div>
              <h3 className="text-lg font-semibold">Getting Started</h3>
              <p className="text-muted-foreground">
                {error}. Start using the app to see your personalized usage data.
              </p>
              <Button onClick={handleRefresh} className="bg-focus hover:bg-focus/90">
                Check for Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Distraction Alert */}
      {stats && stats.appSwitches > 20 && (
        <DistractionAlert
          message="High tab switching activity detected"
          appName="Multiple Tabs"
          onTakeBreak={() => console.log("Taking break")}
          onDismiss={() => console.log("Alert dismissed")}
        />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <FocusCard
          title="Focus Time Today"
          value={stats ? formatTime(stats.totalFocusTime) : "0m"}
          description={stats && stats.totalScreenTime > 0 ? 
            `${Math.round((stats.totalFocusTime / stats.totalScreenTime) * 100)}% of screen time` : 
            "Start a focus session"
          }
          progress={stats && stats.totalScreenTime > 0 ? 
            Math.round((stats.totalFocusTime / stats.totalScreenTime) * 100) : 0
          }
          variant="focus"
          icon={<Target className="h-4 w-4" />}
        />

        <FocusCard
          title="Tab Switches"
          value={stats ? stats.appSwitches.toString() : "0"}
          description={stats && stats.appSwitches > 20 ? "Higher than optimal" : "Good focus discipline"}
          variant={stats && stats.appSwitches > 20 ? "warning" : "calm"}
          icon={<Smartphone className="h-4 w-4" />}
        />

        <FocusCard
          title="Screen Time"
          value={stats ? formatTime(stats.totalScreenTime) : "0m"}
          description="Total active time today"
          variant="calm"
          icon={<Clock className="h-4 w-4" />}
        />

        <FocusCard
          title="Distraction Time"
          value={stats ? formatTime(stats.distractionTime) : "0m"}
          description={stats && stats.totalScreenTime > 0 ? 
            `${Math.round((stats.distractionTime / stats.totalScreenTime) * 100)}% of screen time` : 
            "No distractions yet"
          }
          variant="warning"
          icon={<Zap className="h-4 w-4" />}
        />
      </div>

      {/* Usage Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {stats && stats.activities.length > 0 ? (
          <AppUsageChart />
        ) : (
          <Card className="lg:col-span-2">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Activity tracking in progress...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Use the app for a few minutes to see your usage patterns
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={handleStartFocusSession}
              >
                <Target className="mr-2 h-4 w-4" />
                Start Focus Session
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                Take Scheduled Break
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/patterns')}
              >
                <Zap className="mr-2 h-4 w-4" />
                Review Patterns
              </Button>
            </div>
          </div>





          {/* Today's Insights */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Today's Insights</h3>
            <div className="space-y-3">
              {stats ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-focus mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">
                        {stats.sessionCount > 0 ? `${stats.sessionCount} focus sessions completed` : "Ready to focus"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stats.totalFocusTime > 0 ? `${formatTime(stats.totalFocusTime)} total focus time` : "Start your first session"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-warning mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">
                        {stats.distractionCount > 0 ? `${stats.distractionCount} distractions logged` : "No distractions"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stats.distractionCount > 5 ? "Consider break reminders" : "Good focus discipline"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-calm mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">
                        {stats.appSwitches < 20 ? "Steady focus pattern" : "High activity detected"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stats.appSwitches} tab switches today
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">Building your insights...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
