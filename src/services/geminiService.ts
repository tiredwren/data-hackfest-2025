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
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      return "Unable to generate AI insights at this time. Please try again later.";
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
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      const fallbackTips = [
        "💡 Tip: Use the 2-minute rule - if a task takes less than 2 minutes, do it immediately.",
        "🎯 Tip: Try time-blocking - assign specific time slots to different activities.",
        "🔕 Tip: Turn off non-essential notifications during focus sessions.",
        "🌱 Tip: Take regular breaks to maintain mental energy throughout the day.",
        "📝 Tip: Keep a distraction list - write down random thoughts to address later."
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
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      const fallbackActivities = [
        "🌿 Step outside for fresh air and gentle stretching.",
        "💧 Drink a glass of water and do some neck rolls.",
        "👁️ Look out the window and focus on distant objects for eye relief.",
        "🧘 Try 5 minutes of deep breathing or meditation.",
        "🚶 Take a short walk around your space or building."
      ];
      return fallbackActivities[Math.floor(Math.random() * fallbackActivities.length)];
    }
  }
}

export const geminiService = new GeminiService();
