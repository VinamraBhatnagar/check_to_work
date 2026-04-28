# Mini Project - 4th Sem

Learning Self-Correcting Reasoning in Large Language Models without Supervision.

## What is included

- Next.js frontend with landing page, auth, chat UI, history, models, metrics, settings, and training dashboard.
- FastAPI reasoning backend with streaming `/solve`, validation, rate limiting, security headers, metrics, model metadata, and training job endpoints.
- Firebase auth and Firestore chat storage.
- OpenRouter-backed reasoning engine with multi-path sampling, critique, self-correction, and final synthesis.

## Project structure

```text
frontend/          Next.js app
backend/python/    FastAPI reasoning service
backend/src/       Minimal Express health server kept for compatibility
```

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Required frontend environment variables are listed in `frontend/.env.example`.

## Python backend setup

```bash
cd backend/python
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

Set `OPENROUTER_API_KEY` for live LLM calls. Without it, the frontend still falls back to demo reasoning.

## Backend endpoints

- `GET /health`
- `POST /solve`
- `GET /metrics`
- `GET /models`
- `GET /training/jobs`
- `POST /training/run`

## Security notes

- Do not commit Firebase or OpenRouter keys.
- Set Netlify variables in the Netlify dashboard.
- Set backend `ALLOWED_ORIGINS` to the deployed frontend origin.
- Firestore rules should restrict `chats` so users can read and write only documents where `userId == request.auth.uid`.
