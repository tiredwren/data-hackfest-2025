# Welcome to Clarity, a Smart Focus Tracker for ADHD

## Editing this repo

Recommended to use VSC, but any text editor will work.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/tiredwren/data-hackfest-2025.git

# Step 2: Navigate to the project directory.
cd data-hackfest-2025

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Configure environment variables (optional)
# Copy the environment template and add your API keys
cp .env.example .env
# Then edit .env and add your Gemini API key for AI features

# Step 5: Start the development server
# For web development:
npm run dev

# For mobile (Android):
npm run build
npx cap sync
npx cap run android
```

## AI Features

Clarity includes AI-powered insights using Google's Gemini API:

- **Usage Pattern Analysis**: Get personalized insights about your focus habits
- **Smart Focus Tips**: Receive AI-generated productivity recommendations
- **Break Suggestions**: Get intelligent break activity suggestions

### Setting up AI Features

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Copy `.env.example` to `.env`
3. Add your API key: `VITE_GEMINI_API_KEY=your_api_key_here`
4. Restart the development server

The app works without AI features, but you'll get enhanced insights with the API key configured.

## Technologies used for this project

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Google Gemini AI
- Capacitor (for mobile)
