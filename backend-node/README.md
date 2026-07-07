
# ManaStudyAI Backend (Node.js + TypeScript)

This backend provides Supabase-based authentication endpoints (register, login, forgot password), file uploads, rate limiting and Swagger docs.

## Quickstart

1. Copy `.env.example` to `.env` and set `SUPABASE_URL` and `SUPABASE_KEY`.

Also set the Gemini API values if you want real AI responses:

```
GEMINI_API_URL=https://api.generativeai.google/v1beta2/models/gemini-1.5-preview:generate
GEMINI_API_KEY=your_key_here
```

```bash
cd backend-node
npm install
npm run dev
```

## Docker

Build and run with Docker:

```bash
docker build -t mana-backend .
docker run --env-file .env -p 4000:4000 mana-backend
```

Or with docker-compose:

```bash
docker-compose up --build
```

## API endpoints
- `POST /api/v1/auth/register` { email, password }
- `POST /api/v1/auth/login` { email, password }
- `POST /api/v1/auth/forgot-password` { email }
- `POST /api/v1/upload` multipart form with `file` field
- Swagger UI at `/api-docs`

