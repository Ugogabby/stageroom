# StageRoom — Monorepo

Premium performance training platform for global professionals.

## Architecture

```
/stageroom
  /apps
    /web   → Next.js 14 App Router (TypeScript) — port 3000
    /api   → FastAPI + SQLAlchemy — port 8000
  /packages  (reserved for shared code)
  render.yaml
```

| Layer | Tech | Notes |
|-------|------|-------|
| Frontend | Next.js 14, TypeScript, TailwindCSS (inline styles MVP) | App Router, `"use client"` where needed |
| Backend | FastAPI, SQLAlchemy, Pydantic | Modular routers, JWT auth |
| Database | SQLite (dev) / PostgreSQL (prod) | Switchable via `DATABASE_URL` |
| Auth | JWT Bearer tokens | `python-jose` + `passlib[bcrypt]` |
| Deploy | Render.com | 2 services + managed Postgres |

---

## Local Development (Windows)

### Prerequisites

- **Node.js 18+** → https://nodejs.org
- **Python 3.11+** → https://python.org
- **Git** → https://git-scm.com

### 1. Clone

```powershell
git clone https://github.com/YOUR_USER/stageroom.git
cd stageroom
```

### 2. Backend (apps/api)

```powershell
cd apps/api
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Create .env
copy .env.example .env

# Seed demo data
python scripts/seed.py

# Run
uvicorn main:app --reload --port 8000
```

### 3. Frontend (apps/web)

Open a second terminal:

```powershell
cd apps/web
npm install

# Create .env.local
copy .env.example .env.local

npm run dev
```

Open **http://localhost:3000**.

### 4. Test Auth Flow

1. Visit http://localhost:3000/auth
2. Register with any email + password
3. You'll be redirected to /app
4. Try "Today's Plan" and "Record & Review"

---

## Production Deploy (Render.com)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial StageRoom monorepo"
git remote add origin https://github.com/YOUR_USER/stageroom.git
git push -u origin main
```

### 2. Create Render Resources

#### A) PostgreSQL Database
- Render Dashboard → New → PostgreSQL
- Name: `stageroom-db`
- Copy the **Internal Database URL**

#### B) API Service (FastAPI)
- New → Web Service → connect your repo
- **Name:** `stageroom-api`
- **Root Directory:** `apps/api`
- **Runtime:** Python 3
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables:**
  - `DATABASE_URL` = (Internal Postgres URL from step A)
  - `JWT_SECRET` = (generate a strong random string)
  - `CORS_ORIGINS` = `https://stageroom-web.onrender.com`

#### C) Web Service (Next.js)
- New → Web Service → connect same repo
- **Name:** `stageroom-web`
- **Root Directory:** `apps/web`
- **Runtime:** Node
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `NEXT_PUBLIC_API_URL` = `https://stageroom-api.onrender.com`

### 3. (Alternative) Use render.yaml

The repo includes `render.yaml`. In Render Dashboard → Blueprints → connect repo → it will auto-create all three resources.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| CORS errors in browser | Check `CORS_ORIGINS` env var on API service matches your frontend URL exactly (no trailing slash) |
| `DATABASE_URL` starts with `postgres://` | SQLAlchemy needs `postgresql://`. The API code auto-replaces this. |
| 401 on /app pages | Token expired or missing. Log out and back in. |
| Audio upload fails | Max upload size is 50 MB. Check file picker accepted types. |
| Seed script error | Make sure venv is active and `.env` exists |
