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
