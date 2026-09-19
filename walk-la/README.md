

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/961a053e-52da-4829-ae8b-ff39e3a26be8

## Run Locally

**Prerequisites:**  Node.js, install from their official website https://nodejs.org/en/download 

1. Go to project folder
   `cd walk-la`
2. Install dependencies:
   `npm install`
3. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
4. In one terminal, run
   `npm run server`
5. In a separate terinal, run the app:
   `npm run dev`
