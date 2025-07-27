import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Brain, Clock, TrendingUp, Calendar, Zap, Target, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRealUsageStats } from "@/hooks/useRealUsageStats";
import { UsageHeatmap } from "@/components/UsageHeatmap";
import { FocusTrendsChart } from "@/components/FocusTrendsChart";
import { DistractionPatterns } from "@/components/DistractionPatterns";
import { geminiService } from "@/services/geminiService";
import { toast } from "sonner";


export default function PatternAnalysis() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const { stats } = useRealUsageStats({
    startDate: today,
    endDate: today
  });

  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiInsights, setAiInsights] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const generateAISummary = async () => {
    if (!stats || !geminiService.isConfigured()) return;

    setIsGeneratingSummary(true);
    try {
      const summary = await geminiService.generateFocusTip();
      setAiSummary(summary);
      toast.success("Daily summary generated!");
    } catch (error) {
      console.error('Error generating AI summary:', error);
      setAiSummary('Unable to generate summary. Please try again later.');
      toast.error("Failed to generate summary");
    }
    setIsGeneratingSummary(false);
  };

  const generateAIInsights = async () => {
    if (!stats || !geminiService.isConfigured()) return;

    setIsGeneratingInsights(true);
    try {
      const insights = await geminiService.analyzeUsagePatterns(stats);
      setAiInsights(insights);
      toast.success("AI insights generated!");
    } catch (error) {
      console.error('Error generating AI insights:', error);
      setAiInsights('Unable to generate insights. Please try again later.');
      toast.error("Failed to generate insights");
    }
    setIsGeneratingInsights(false);
  };

  // Generate summary on first load
  useEffect(() => {
    if (stats && geminiService.isConfigured()) {
      generateAISummary();
    }
  }, [stats]);

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
              disabled={isGeneratingSummary || !geminiService.isConfigured()}
              size="sm"
              variant="ghost"
              className="text-sm gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isGeneratingSummary ? 'animate-spin' : ''}`} />
              {isGeneratingSummary ? 'Generating...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {aiSummary ? (
            <div className="bg-focus/10 border border-focus/20 rounded-lg p-4">
              <p className="text-foreground leading-relaxed">{aiSummary}</p>
            </div>
          ) : (
            <div className="text-muted-foreground">
              {!geminiService.isConfigured() ? (
                <div>
                  <p>🤖 Enable AI insights by adding your Gemini API key:</p>
                  <p className="mt-2 font-mono text-xs bg-muted p-2 rounded">
                    Add VITE_GEMINI_API_KEY to your environment variables
                  </p>
                </div>
              ) : (
                "Loading your daily summary..."
              )}
            </div>
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
