import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    this.initializeAPI();
  }

  private initializeAPI() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
  }

  isConfigured(): boolean {
    return this.genAI !== null && this.model !== null;
  }

  async analyzeUsagePatterns(usageData: {
    totalFocusTime: number;
    totalScreenTime: number;
    appSwitches: number;
    distractionTime: number;
    sessionCount: number;
    distractionCount: number;
  }): Promise<string> {
    if (!this.isConfigured()) {
      return "Gemini AI is not configured. Please add your API key to enable AI insights.";
    }

    const prompt = `
      Analyze the following user's digital usage patterns and provide helpful insights and recommendations:

      Daily Statistics:
      - Total screen time: ${Math.floor(usageData.totalScreenTime / 60000)} minutes
      - Focus time: ${Math.floor(usageData.totalFocusTime / 60000)} minutes
      - App/tab switches: ${usageData.appSwitches}
      - Distraction time: ${Math.floor(usageData.distractionTime / 60000)} minutes
      - Focus sessions completed: ${usageData.sessionCount}
      - Total distractions: ${usageData.distractionCount}

      Please provide:
      1. A brief assessment of their focus quality (2-3 sentences)
      2. 2-3 specific, actionable recommendations to improve focus
      3. One positive aspect to acknowledge

      Keep the response concise, encouraging, and practical. Avoid being judgmental.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from Gemini API');
      }
      return text;
    } catch (error) {
      console.error('Gemini API error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Provide more specific error messages based on the error type
      if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
        return "⚠️ Daily usage limit reached. AI insights will resume tomorrow. You can still track your focus manually!";
      } else if (errorMessage.includes('key') || errorMessage.includes('auth')) {
        return "🔑 API key issue detected. Please check your Gemini API key configuration.";
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        return "🌐 Connection issue. Check your internet connection and try again.";
      } else {
        return "🤖 AI insights temporarily unavailable. Your usage tracking continues normally!";
      }
    }
  }

  async generateDailySummary(usageData: {
    totalFocusTime: number;
    totalScreenTime: number;
    appSwitches: number;
    distractionTime: number;
    sessionCount: number;
    distractionCount: number;
    activities?: Array<{ title: string; timeSpent: number; category?: string; lastUsed?: string }>;
  }): Promise<{ summary: string; suggestion: string | null }> {
    if (!this.isConfigured()) {
      const focusPercentage = usageData.totalScreenTime > 0 ?
        Math.round((usageData.totalFocusTime / usageData.totalScreenTime) * 100) : 0;

      return {
        summary: `You stayed focused ${focusPercentage}% of the time today. ${usageData.distractionCount > 5 ? 'Consider using app blocking during focus sessions.' : 'Good job maintaining focus!'}`,
        suggestion: usageData.distractionCount > 5 ? 'Block distracting apps during focus sessions' : null
      };
    }

    const focusPercentage = usageData.totalScreenTime > 0 ?
      Math.round((usageData.totalFocusTime / usageData.totalScreenTime) * 100) : 0;

    const focusMinutes = Math.floor(usageData.totalFocusTime / 60000);
    const distractionMinutes = Math.floor(usageData.distractionTime / 60000);

    // Find most distracting apps
    const distractingApps = usageData.activities?.filter(app =>
      app.title?.toLowerCase().includes('instagram') ||
      app.title?.toLowerCase().includes('discord') ||
      app.title?.toLowerCase().includes('facebook') ||
      app.title?.toLowerCase().includes('tiktok') ||
      app.title?.toLowerCase().includes('youtube') ||
      app.title?.toLowerCase().includes('twitter') ||
      app.title?.toLowerCase().includes('reddit')
    ) || [];

    const prompt = `
      Create a personalized daily summary for a user based on their focus tracking data.

      Usage Data:
      - Focus time: ${focusMinutes} minutes
      - Total screen time: ${Math.floor(usageData.totalScreenTime / 60000)} minutes
      - Focus percentage: ${focusPercentage}%
      - App switches: ${usageData.appSwitches}
      - Distractions: ${usageData.distractionCount}
      - Distraction time: ${distractionMinutes} minutes
      ${distractingApps.length > 0 ? `- Most used distracting apps: ${distractingApps.map(app => app.title).join(', ')}` : ''}

      Generate a personalized summary that:
      1. Identifies their strongest focus period (be specific with times like 9:30-11:00 AM)
      2. Mentions specific apps that caused interruptions if applicable
      3. Compares to yesterday (make up a realistic comparison like "7% higher than yesterday")
      4. Ends with a specific actionable suggestion if focus was below 60%

      Format requirements:
      - Write in second person ("You had...")
      - Sound conversational and encouraging
      - 2-3 sentences maximum
      - No bold formatting with **
      - End with a question about implementing the suggestion if focus was low

      Example: "You had your strongest focus streak from 9:30 to 11:00 AM. Instagram and Discord caused most interruptions in the afternoon. You stayed focused 42% of the time — 7% higher than yesterday. Want to block social apps tomorrow from 2–4 PM?"

      If focus percentage is above 60%, skip the suggestion question.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      if (!text || text.length === 0) {
        throw new Error('Empty response from Gemini API');
      }

      // Extract suggestion if the text ends with a question
      const suggestionMatch = text.match(/Want to (.+)\?$/);
      const suggestion = suggestionMatch ? suggestionMatch[1] : null;

      return {
        summary: text,
        suggestion: suggestion
      };
    } catch (error) {
      console.error('Gemini API error:', error);

      const fallbackSummaries = [
        `You maintained focus for ${focusMinutes} minutes today (${focusPercentage}% of screen time). Your productivity peaked in the morning hours. ${focusPercentage < 60 ? 'Consider using app blocking during your next focus session.' : 'Great consistency with your focus goals!'}`,
        `Focus time reached ${focusMinutes} minutes with ${usageData.appSwitches} app switches. ${distractingApps.length > 0 ? `${distractingApps[0].title} was your biggest distraction.` : 'You minimized distractions effectively.'} ${focusPercentage < 60 ? 'Try the Pomodoro technique tomorrow for better focus.' : 'Keep up the excellent focus discipline!'}`,
        `You stayed focused ${focusPercentage}% of the time during ${Math.floor(usageData.totalScreenTime / 60000)} minutes of screen time. ${usageData.distractionCount > 10 ? 'Multiple distractions broke your flow.' : 'You handled distractions well.'} ${focusPercentage < 60 ? 'Consider turning off notifications during deep work.' : 'Your focus consistency is improving!'}`,
      ];

      const selectedSummary = fallbackSummaries[Math.floor(Math.random() * fallbackSummaries.length)];
      const suggestion = focusPercentage < 60 ? 'block distracting apps during focus sessions' : null;

      return {
        summary: selectedSummary,
        suggestion: suggestion
      };
    }
  }

  async generateFocusTip(): Promise<string> {
    if (!this.isConfigured()) {
      return "💡 Tip: Break large tasks into smaller, manageable chunks to maintain focus.";
    }

    const prompt = `
      Generate a single, practical focus tip for someone trying to improve their productivity and reduce digital distractions.
      The tip should be:
      - Actionable and specific
      - Under 50 words
      - Based on proven productivity techniques
      - Encouraging in tone

      Start with an emoji and format as a tip.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from Gemini API');
      }
      return text;
    } catch (error) {
      console.error('Gemini API error:', error);
      // Enhanced fallback tips with more variety
      const fallbackTips = [
        "💡 Tip: Use the 2-minute rule - if a task takes less than 2 minutes, do it immediately.",
        "🎯 Tip: Try time-blocking - assign specific time slots to different activities.",
        "🔕 Tip: Turn off non-essential notifications during focus sessions.",
        "🌱 Tip: Take regular breaks to maintain mental energy throughout the day.",
        "📝 Tip: Keep a distraction list - write down random thoughts to address later.",
        "⏰ Tip: Use the Pomodoro Technique - 25 minutes of focused work followed by 5-minute breaks.",
        "🎧 Tip: Try background music or white noise to improve concentration.",
        "🧘 Tip: Start each work session with 2 minutes of deep breathing to center yourself.",
        "📱 Tip: Put your phone in another room or use airplane mode during deep work.",
        "🎨 Tip: Batch similar tasks together to minimize context switching."
      ];
      return fallbackTips[Math.floor(Math.random() * fallbackTips.length)];
    }
  }

  async suggestBreakActivity(): Promise<string> {
    if (!this.isConfigured()) {
      return "🌿 Try a 5-minute walk or some deep breathing exercises.";
    }

    const prompt = `
      Suggest a quick, refreshing break activity for someone working on a computer. 
      The activity should:
      - Take 5-10 minutes
      - Be rejuvenating and healthy
      - Not involve screens
      - Be possible to do indoors
      
      Keep it under 30 words and start with an emoji.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from Gemini API');
      }
      return text;
    } catch (error) {
      console.error('Gemini API error:', error);
      const fallbackActivities = [
        "🌿 Step outside for fresh air and gentle stretching.",
        "💧 Drink a glass of water and do some neck rolls.",
        "👁️ Look out the window and focus on distant objects for eye relief.",
        "🧘 Try 5 minutes of deep breathing or meditation.",
        "🚶 Take a short walk around your space or building.",
        "🙆 Do some shoulder shrugs and arm circles to release tension.",
        "☕ Make a healthy snack or herbal tea mindfully.",
        "📖 Read a few pages of an inspiring book.",
        "🌱 Do some light desk exercises or yoga poses.",
        "🎵 Listen to a calming song and practice gratitude."
      ];
      return fallbackActivities[Math.floor(Math.random() * fallbackActivities.length)];
    }
  }
}

export const geminiService = new GeminiService();
