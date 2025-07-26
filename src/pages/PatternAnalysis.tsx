import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Brain, Clock, TrendingUp, Calendar, Zap, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { UsageHeatmap } from "@/components/UsageHeatmap";
import { FocusTrendsChart } from "@/components/FocusTrendsChart";
import { DistractionPatterns } from "@/components/DistractionPatterns";

export default function PatternAnalysis() {
  const navigate = useNavigate();
  const { usageStats } = useUsageTracking();
  const [geminiApiKey, setGeminiApiKey] = useState(localStorage.getItem('gemini-api-key') || '');
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const saveApiKey = () => {
    localStorage.setItem('gemini-api-key', geminiApiKey);
  };

  const generateAISummary = async () => {
    if (!geminiApiKey) {
      alert('Please enter your Gemini API key first');
      return;
    }

    setIsGenerating(true);
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(geminiApiKey);
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
      console.error('Error generating AI summary:', error);
      setAiSummary('Unable to generate summary. Please check your API key and try again.');
    }
    setIsGenerating(false);
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
          <h1 className="text-2xl font-bold text-foreground">Pattern Analysis</h1>
          <p className="text-muted-foreground">AI-powered insights into your usage patterns</p>
        </div>
      </div>

      {/* API Key Setup */}
      {!localStorage.getItem('gemini-api-key') && (
        <Card className="border-focus bg-focus/5 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-focus" />
              Setup Gemini AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="api-key">Gemini API Key</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your Gemini API key"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                />
                <Button onClick={saveApiKey} disabled={!geminiApiKey}>
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-focus underline">Google AI Studio</a>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
              disabled={isGenerating || !geminiApiKey}
              size="sm"
            >
              {isGenerating ? 'Generating...' : 'Generate Summary'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {aiSummary ? (
            <div className="bg-focus/10 border border-focus/20 rounded-lg p-4">
              <p className="text-foreground leading-relaxed">{aiSummary}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">Click "Generate Summary" to get AI insights about your usage patterns.</p>
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

        {/* Focus Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-focus" />
              Focus Trends
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
                <p className="text-lg font-semibold">9:00 - 10:00 AM</p>
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
                <p className="text-lg font-semibold">Social Media</p>
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
                <p className="text-lg font-semibold">23 minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}