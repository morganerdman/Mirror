# Mirror Project Setup (Professor)

## Prerequisites
- Node.js 18+ installed
- An Anthropic API key

## Setup
1. Open a terminal in this project folder.
2. Install dependencies:
   - `npm install`
3. Create a local env file:
   - copy `.env.example` to `.env`
   - set `ANTHROPIC_API_KEY` in `.env`

## Run
- Start the app:
  - `npm run dev`
- Open:
  - `http://127.0.0.1:8788/`

## Notes
- The app includes v1 and v2 flows.
- If the default model is too expensive, set `ANTHROPIC_MODEL` in `.env` to a cheaper Anthropic model.
