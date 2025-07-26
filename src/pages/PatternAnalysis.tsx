import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Brain, Clock, TrendingUp, Calendar, Zap, Target, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { UsageHeatmap } from "@/components/UsageHeatmap";
import { FocusTrendsChart } from "@/components/FocusTrendsChart";
import { DistractionPatterns } from "@/components/DistractionPatterns";
import { GoogleGenerativeAI } from "@google/generative-ai";


export default function PatternAnalysis() {
  const navigate = useNavigate();
  const { usageStats } = useUsageTracking();

  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const GEMINI_API_KEY = 'AIzaSyDjbO-hpqxxJ7xyZzLtnGhV-_H4YmAAVwU';

  const generateAISummary = async () => {
    if (!GEMINI_API_KEY) return;

    setIsGenerating(true);
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const usageData = {
        totalScreenTime: usageStats?.totalScreenTime || 0,
        focusTime: usageStats?.focusTime || 0,
        distractionTime: usageStats?.distractionTime || 0,
        appSwitches: usageStats?.appSwitches || 0,
        focusPercentage: usageStats ? Math.round((usageStats.focusTime / usageStats.totalScreenTime) * 100) : 0
      };

      const prompt = `Analyze this phone usage data and create a natural, encouraging summary in 2-3 sentences:

        Total screen time: ${Math.round(usageData.totalScreenTime / (1000 * 60))} minutes
        Focus time: ${Math.round(usageData.focusTime / (1000 * 60))} minutes
        Distraction time: ${Math.round(usageData.distractionTime / (1000 * 60))} minutes
        App switches: ${usageData.appSwitches}
        Focus percentage: ${usageData.focusPercentage}%

        Include:
        - Main focus periods and strongest streaks
        - Primary distraction sources
        - Comparison to typical usage (make up reasonable comparison)
        - Actionable suggestion for tomorrow

        Keep it personal, encouraging, and under 100 words. Write like a helpful AI coach.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAiSummary(response.text());
    } catch (error) {
      alert('Error generating AI summary:' + error.message);
      setAiSummary('Unable to generate summary. Please try again later.');
    }
    setIsGenerating(false);
  };

  // Generate on first load
  useEffect(() => {
    if (usageStats) generateAISummary();
  }, [usageStats]);

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your Focus Trends</h1>
          <p className="text-muted-foreground">AI-powered insights into your usage patterns</p>
        </div>
      </div>

      {/* AI Summary */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-focus" />
              Daily Summary
            </CardTitle>
            <Button
              onClick={generateAISummary}
              disabled={isGenerating}
              size="sm"
              variant="ghost"
              className="text-sm gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {aiSummary ? (
            <div className="bg-focus/10 border border-focus/20 rounded-lg p-4">
              <p className="text-foreground leading-relaxed">{aiSummary}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">Loading your daily summary...</p>
          )}
        </CardContent>
      </Card>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Usage Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-calm" />
              Weekly Usage Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UsageHeatmap />
          </CardContent>
        </Card>

        {/* Line Graph */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-focus" />
              Usage Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FocusTrendsChart />
          </CardContent>
        </Card>
      </div>

      {/* Distraction Analysis */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            Distraction Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DistractionPatterns />
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-focus/20 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-focus" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peak Focus Hour</p>
                <p className="text-lg font-semibold">
                  {usageStats?.focusTime > 0 ? '9:00 - 11:00 AM' : 'No data yet'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Most Distracting</p>
                <p className="text-lg font-semibold">
                  {usageStats?.apps?.find(app => 
                    app.packageName.includes('instagram') || 
                    app.packageName.includes('tiktok') ||
                    app.packageName.includes('facebook')
                  )?.appName || 'Social Media'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-calm/20 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-calm" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Session</p>
                <p className="text-lg font-semibold">
                  {usageStats?.apps?.length > 0 
                    ? `${Math.round(usageStats.totalScreenTime / (usageStats.apps.length * 1000 * 60))} min`
                    : 'No data'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
