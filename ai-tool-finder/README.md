# AI Tool Recommender Platform (MVP)

This folder contains a full-stack MVP implementation of an AI Tool Discovery engine.

## Stack
- Client: React + Vite + Tailwind + Framer Motion
- Server: Node.js + Express + MongoDB
- AI: Gemini (intent), HuggingFace (embeddings) with local fallbacks
- Scraping: Puppeteer + Cheerio

## Run locally

### 1) Server
```bash
cd ai-tool-finder/server
npm install
cp .env.example .env
npm run dev
```

### 2) Client
```bash
cd ai-tool-finder/client
npm install
npm run dev
```

## API endpoints
- `GET /api/search?q=<query>`
- `GET /api/tools`
- `GET /api/tools/trending`
- `POST /api/tools`
- `POST /api/tools/compare`
- `POST /api/tools/analytics/time-spent`

## Notes
- `vectorSearchService` can be swapped with Supabase pgvector RPC for production.
- Cron updates tool directory every 12 hours.
