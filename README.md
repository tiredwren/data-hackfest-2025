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

## Technologies used for this project

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
