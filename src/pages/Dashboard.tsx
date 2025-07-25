import { FocusCard } from "@/components/FocusCard";
import { AppUsageChart } from "@/components/AppUsageChart";
import { DistractionAlert } from "@/components/DistractionAlert";
import { Button } from "@/components/ui/button";
import { Clock, Smartphone, Zap, Target, Settings } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">FocusTrack</h1>
          <p className="text-muted-foreground">Your mindful usage companion</p>
        </div>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Distraction Alert */}
      <DistractionAlert 
        message="Frequent app switching detected"
        appName="Instagram"
        onTakeBreak={() => console.log("Taking break")}
        onDismiss={() => console.log("Alert dismissed")}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <FocusCard
          title="Focus Time Today"
          value="4h 23m"
          description="87% of your 5h goal"
          progress={87}
          variant="focus"
          icon={<Target className="h-4 w-4" />}
        />
        
        <FocusCard
          title="App Switches"
          value="23"
          description="Lower than yesterday"
          variant="calm"
          icon={<Smartphone className="h-4 w-4" />}
        />
        
        <FocusCard
          title="Longest Session"
          value="1h 45m"
          description="VS Code coding session"
          variant="focus"
          icon={<Clock className="h-4 w-4" />}
        />
        
        <FocusCard
          title="Distraction Score"
          value="Low"
          description="3 interruptions detected"
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
              <Button className="w-full justify-start" variant="outline">
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