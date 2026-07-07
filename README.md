# ManaStudy AI

Production-oriented React Native + FastAPI MVP for AI-powered study material summarization and quiz generation.

## Implemented Scope

- React Native app foundation with TypeScript
- Bottom tab navigation: Home, My Summaries, Quiz, Settings
- Premium dark-style UI aligned to your shared reference screens
- Upload flow with file picker (PDF, DOCX, PPT, images)
- Summary output UI (structured cards and quick revision)
- Summaries list with search, view, and delete actions
- Quiz flow with MCQ selection, attempt count, and score
- Settings/Profile page with theme toggle and account sections
- FastAPI backend scaffold with required MVP endpoints
- Backend service layers for auth, summary, quiz, and AI hooks

## Project Structure

- Frontend app: `src/`
- Backend API: `backend/app/`

## Frontend Setup (React Native)

1. Install dependencies:

```sh
npm install
```

2. Start Metro:

```sh
npm start
```

3. Run Android:

```sh
npm run android
```

4. Run iOS (macOS only):

```sh
bundle install
bundle exec pod install
npm run ios
```

## Backend Setup (FastAPI)

1. Create Python virtual environment and activate it.
2. Install backend dependencies:

```sh
pip install -r backend/requirements.txt
```

3. Create backend env file from template:

```sh
copy backend/.env.example backend/.env
```

4. Start API server:

```sh
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

5. Health check:

```sh
http://localhost:8000/health
```

## API Endpoints Implemented

- POST /register
- POST /login
- POST /forgot-password
- POST /upload
- POST /summary
- GET /summaries
- GET /summary/{id}
- DELETE /summary/{id}
- POST /quiz
- GET /quiz/{id}
- POST /quiz/submit

## Integration Notes

- Frontend API base URL is set to `http://10.0.2.2:8000` for Android emulator.
- Backend currently includes safe mock fallback behavior in services where third-party setup is missing.
- Supabase and Gemini hooks are scaffolded and ready to wire with real keys.
- Existing auth screens (Welcome/Login/Register/Forgot Password) are intentionally left for your provided code integration.

## Supabase SQL Setup

1. Open Supabase project -> SQL Editor.
2. Run the schema file:

`backend/supabase/schema.sql`

3. Create a storage bucket named `study-materials`.
4. Add your Supabase keys to `backend/.env`.

## Verification

- Lint: `npm run lint`
- TypeScript compile: `npx tsc --noEmit`
