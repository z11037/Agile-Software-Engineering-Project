# Frontend — DIICSU English Hub

React 19 + TypeScript single-page application built with Vite 7 and Tailwind CSS 4.

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 19 | UI framework |
| TypeScript | ~5.9 | Type safety |
| Vite | 7 | Dev server and bundler |
| Tailwind CSS | 4 | Utility-first styling |
| React Router | 7 | Client-side routing |
| Axios | 1.x | HTTP client with JWT interceptor |
| Recharts | 3.x | Progress charts and analytics |

---

## Setup

### Prerequisites

- Node.js 18+ and npm

### Install & Run

```bash
npm install
npm run dev        # development server at http://localhost:5173
npm run build      # production build (TypeScript check + Vite bundle)
npm run preview    # preview the production build locally
npm run lint       # ESLint check
```

The Vite dev server proxies all `/api` requests to `http://localhost:8000` (the FastAPI backend). No environment variables are required for local development.

---

## Project Structure

```
src/
├── main.tsx              # React entry point (mounts App)
├── App.tsx               # Route definitions (React Router)
├── index.css             # Tailwind CSS base import
├── types/
│   └── index.ts          # Shared TypeScript interfaces (Word, Quiz, Progress, …)
├── services/
│   └── api.ts            # Axios instance — attaches JWT, handles 401 redirect
├── hooks/
│   └── useAuth.tsx       # AuthContext: login, logout, current user state
├── components/
│   ├── Layout.tsx         # Top navigation bar, shared page wrapper
│   └── ProtectedRoute.tsx # Redirects unauthenticated users to /login
└── pages/
    ├── LoginPage.tsx
    ├── RegisterPage.tsx
    ├── DashboardPage.tsx    # Home — streak, today's stats, quick-start buttons
    ├── ReviewPage.tsx       # Flashcard vocabulary review (flip animation)
    ├── QuizPage.tsx         # Multiple-choice quiz with score screen
    ├── ProgressPage.tsx     # Recharts: learning history, accuracy, category breakdown
    ├── WritingPage.tsx      # IELTS writing practice (Task 1 & Task 2)
    ├── SpeakingPage.tsx     # IELTS speaking practice exercises
    └── ListeningPage.tsx    # Transcript-based listening practice
```

---

## Pages & Routes

| Route | Page | Auth required |
|-------|------|:---:|
| `/login` | LoginPage | No |
| `/register` | RegisterPage | No |
| `/` | DashboardPage | Yes |
| `/review` | ReviewPage | Yes |
| `/quiz` | QuizPage | Yes |
| `/progress` | ProgressPage | Yes |
| `/writing` | WritingPage | Yes |
| `/speaking` | SpeakingPage | Yes |
| `/listening` | ListeningPage | Yes |

---

## Authentication Flow

1. User logs in via `POST /api/auth/login` → JWT token received
2. Token stored in `localStorage` under `token`
3. `api.ts` Axios interceptor attaches `Authorization: Bearer <token>` to every request
4. On a 401 response the interceptor clears the token and redirects to `/login`
5. `ProtectedRoute` checks `useAuth()` context; unauthenticated visitors are redirected to `/login`

---

## API Client

`src/services/api.ts` exports a pre-configured Axios instance. All API calls should go through this instance — never construct raw `fetch` or a new `axios` instance in pages.

```ts
import api from '../services/api';

const response = await api.get('/api/words/review');
```

---

## Key Design Decisions

- **Spaced repetition feedback loop** — ReviewPage sends `POST /api/words/{id}/review` with a `knew_it` boolean; the backend schedules the next review date automatically
- **Tailwind v4** — Uses the new `@tailwindcss/vite` plugin (no `tailwind.config.js` required)
- **React Router v7** — Declarative `<Routes>` with nested `<ProtectedRoute>` wrappers
- **Recharts** — Chosen for its composable chart API and React-first design

---

## Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite plugins + `/api` proxy to port 8000 |
| `tsconfig.json` | TypeScript project references root |
| `tsconfig.app.json` | App source tsconfig (strict mode) |
| `tsconfig.node.json` | Node/Vite config tsconfig |
| `eslint.config.js` | ESLint flat config with react-hooks and react-refresh plugins |
