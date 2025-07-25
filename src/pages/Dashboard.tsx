import { FocusCard } from "@/components/FocusCard";
import { AppUsageChart } from "@/components/AppUsageChart";
import { DistractionAlert } from "@/components/DistractionAlert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Smartphone, Zap, Target, Settings, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { registerPlugin } from '@capacitor/core';

const UsageStatsPlugin = registerPlugin<any>('UsageStatsPlugin');

export default function Dashboard() {
  const [usageStats, setUsageStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [focusStartTime, setFocusStartTime] = useState<number | null>(null);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      const res = await UsageStatsPlugin.requestPermission();
      setHasPermission(res.granted);
      if (res.granted) {
        fetchUsageStats();
      }
    } catch (err) {
      console.error("Permission check error:", err);
    }
  };

  const requestPermission = async () => {
    console.log("Requesting permission...");
    try {
      await UsageStatsPlugin.requestPermission();
      await checkPermission();
    } catch (err) {
      console.error("Permission request error:", err);
    }
  };

  const fetchUsageStats = async () => {
    setIsLoading(true);
    try {
      const endTime = Date.now();
      let startTime = focusStartTime;
      // If no focus session started, default to today's start
      if (!startTime) {
        const now = new Date();
        startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      }
      const res = await UsageStatsPlugin.getUsageStats({ startTime, endTime });
      setUsageStats(res);
    } catch (err) {
      console.error("Error fetching usage stats:", err);
    }
    setIsLoading(false);
  };

  const handleStartFocusSession = () => {
    setFocusStartTime(Date.now());
    setUsageStats(null); // Reset stats for new session
  };

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
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
            onClick={fetchUsageStats}
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

      {/* Permission Request */}
      {!hasPermission && (
        <Card className="border-warning bg-warning/5 mb-6">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-warning">
                <Smartphone className="h-12 w-12 mx-auto mb-2" />
              </div>
              <h3 className="text-lg font-semibold">Usage Access Required</h3>
              <p className="text-muted-foreground">
                Grant usage access permission to track your app usage and provide insights.
              </p>
              <Button onClick={requestPermission} className="bg-focus hover:bg-focus/90">
                Grant Permission
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Distraction Alert */}
      {hasPermission && usageStats && usageStats.appSwitches > 50 && (
        <DistractionAlert 
          message="High app switching activity detected"
          appName="Multiple Apps"
          onTakeBreak={() => console.log("Taking break")}
          onDismiss={() => console.log("Alert dismissed")}
        />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <FocusCard
          title="Focus Time Today"
          value={usageStats ? formatTime(usageStats.focusTime) : "Loading..."}
          description={usageStats ? `${Math.round((usageStats.focusTime / usageStats.totalScreenTime) * 100)}% of screen time` : "Calculating..."}
          progress={usageStats ? Math.round((usageStats.focusTime / usageStats.totalScreenTime) * 100) : 0}
          variant="focus"
          icon={<Target className="h-4 w-4" />}
        />
        
        <FocusCard
          title="App Switches"
          value={usageStats ? usageStats.appSwitches.toString() : "Loading..."}
          description={usageStats && usageStats.appSwitches > 75 ? "Higher than average" : "Within normal range"}
          variant={usageStats && usageStats.appSwitches > 75 ? "warning" : "calm"}
          icon={<Smartphone className="h-4 w-4" />}
        />
        
        <FocusCard
          title="Screen Time"
          value={usageStats ? formatTime(usageStats.totalScreenTime) : "Loading..."}
          description="Total device usage today"
          variant="calm"
          icon={<Clock className="h-4 w-4" />}
        />
        
        <FocusCard
          title="Distraction Time"
          value={usageStats ? formatTime(usageStats.distractionTime) : "Loading..."}
          description={usageStats ? `${Math.round((usageStats.distractionTime / usageStats.totalScreenTime) * 100)}% of screen time` : "Calculating..."}
          variant="warning"
          icon={<Zap className="h-4 w-4" />}
        />
      </div>

      {/* Usage Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AppUsageChart />
        
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
              <Button className="w-full justify-start" variant="outline">
                <Zap className="mr-2 h-4 w-4" />
                Review Patterns
              </Button>
            </div>
          </div>

          {/* Today's Insights */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Today's Insights</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-focus mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Great morning focus!</p>
                  <p className="text-xs text-muted-foreground">2.5h uninterrupted coding</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-warning mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Social media peak at 2PM</p>
                  <p className="text-xs text-muted-foreground">Consider a break reminder</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-calm mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Evening wind-down</p>
                  <p className="text-xs text-muted-foreground">Lower screen activity detected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
