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
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const generateAISummary = async () => {
    if (!stats) return;

    setIsGeneratingSummary(true);
    try {
      const result = await geminiService.generateDailySummary(stats);
      setAiSummary(result.summary);
      setSuggestion(result.suggestion);
      toast.success("Daily summary generated!");
    } catch (error) {
      console.error('Error generating AI summary:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
        setAiSummary('⚠️ Daily AI usage limit reached. Summary will be available tomorrow!');
        setSuggestion(null);
        toast.error("Daily AI limit reached");
      } else {
        setAiSummary('🤖 AI summary temporarily unavailable. Your focus tracking continues!');
        setSuggestion(null);
        toast.error("AI service temporarily unavailable");
      }
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
        setAiInsights('⚠️ Daily AI usage limit reached. Insights will be available tomorrow!\n\nIn the meantime, review your patterns manually using the charts above.');
        toast.error("Daily AI limit reached");
      } else {
        setAiInsights('🤖 AI insights temporarily unavailable. You can still analyze your patterns using the visualizations above!\n\nTry refreshing in a few minutes or check your internet connection.');
        toast.error("AI service temporarily unavailable");
      }
    }
    setIsGeneratingInsights(false);
  };



  const formatAIText = (text: string) => {
    // Split text into lines
    const lines = text.split('\n').filter(line => line.trim());

    return lines.map((line, index) => {
      const trimmedLine = line.trim();

      // Convert text surrounded by ** to headings
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        const headingText = trimmedLine.replace(/\*\*/g, '');
        return <h2 key={index} className="text-lg font-semibold mb-2 mt-4">{headingText}</h2>;
      }

      // Handle lines that contain ** formatting
      const formattedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, (match, content) => {
        return content; // Remove ** but keep content for inline headings
      });

      // If line looks like a heading after ** removal (short, no punctuation at end)
      if (formattedLine !== trimmedLine && formattedLine.length < 50 && !formattedLine.match(/[.!?]$/)) {
        return <h2 key={index} className="text-lg font-semibold mb-2 mt-4">{formattedLine}</h2>;
      }

      // Regular paragraph
      if (formattedLine) {
        return <p key={index} className="mb-2">{formattedLine}</p>;
      }

      return null;
    }).filter(Boolean);
  };

  const handleAcceptSuggestion = () => {
    toast.success("Great! We'll help you implement this tomorrow.");
    setSuggestion(null);
  };

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
              disabled={isGeneratingSummary}
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
            <div className="space-y-4">
              <div className="bg-focus/10 border border-focus/20 rounded-lg p-4">
                <div className="text-foreground leading-relaxed">
                  {formatAIText(aiSummary)}
                </div>
              </div>
              {suggestion && (
                <div className="flex items-center justify-between bg-muted/50 border rounded-lg p-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">Suggested action:</p>
                    <p className="text-sm text-muted-foreground capitalize">{suggestion}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSuggestion(null)}
                    >
                      Maybe later
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAcceptSuggestion}
                    >
                      Yes, do this
                    </Button>
                  </div>
                </div>
              )}
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

      {/* AI Insights */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-focus" />
              AI Pattern Analysis
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={generateAIInsights}
              disabled={isGeneratingInsights || !stats || !geminiService.isConfigured()}
            >
              {isGeneratingInsights ? "Analyzing..." : "Get AI Insights"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {aiInsights ? (
            <div className="bg-muted/50 border rounded-lg p-4">
              <div className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                {aiInsights}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-center py-8">
              {!geminiService.isConfigured() ? (
                <div>
                  <Brain className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="mb-2">🤖 AI insights unavailable</p>
                  <p className="text-xs">Configure your Gemini API key to unlock AI-powered pattern analysis</p>
                </div>
              ) : (
                <div>
                  <Brain className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p>Click "Get AI Insights" to analyze your usage patterns with AI</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
                  {stats?.totalFocusTime > 0 ? '9:00 - 11:00 AM' : 'No data yet'}
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
                  {stats?.activities?.find(activity =>
                    activity.title?.toLowerCase().includes('instagram') ||
                    activity.title?.toLowerCase().includes('tiktok') ||
                    activity.title?.toLowerCase().includes('facebook')
                  )?.title || 'Social Media'}
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
                  {stats?.activities?.length > 0
                    ? `${Math.round(stats.totalScreenTime / (stats.activities.length * 1000 * 60))} min`
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
