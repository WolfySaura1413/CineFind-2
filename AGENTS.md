# AGENTS.md — CineFind

This file is for AI coding agents (Claude, Copilot, Cursor, etc.). Read it fully before writing, editing, or reviewing any code in this project.

---

## Project summary

CineFind is a mobile-first movie and TV show discovery app for casual viewers. It is built on a BaaS backend (Firebase or Supabase — see below) and integrates with the Watchmode API for streaming data. The mobile framework has not yet been finalised.

---

## Framework status

**The mobile framework (React Native vs Flutter) has not been decided.**

- Do not scaffold a full project structure until the framework is confirmed
- When asked to write a UI component, ask which framework to target first, or write it for both with clearly separated sections
- Once confirmed, update this file with the chosen framework and remove this notice

### If React Native / Expo is chosen
- Use functional components and hooks only — no class components
- Use Expo Router for navigation
- Use `zustand` for global state (auth, lists)
- Use `@tanstack/react-query` for all API data fetching and caching
- Style with `StyleSheet.create` — no inline styles unless truly one-off

### If Flutter is chosen
- Use `riverpod` for state management
- Use `go_router` for navigation
- Follow feature-first folder structure (`lib/features/auth/`, `lib/features/search/`, etc.)
- Use `dio` for HTTP requests to the Watchmode API

---

## Backend: Firebase or Supabase

**The BaaS provider (Firebase vs Supabase) has not been finalised.**

When writing backend-touching code:
- Abstract all database and auth calls behind a service layer (`src/services/auth.js`, `src/services/db.js`)
- Never call Firebase/Supabase SDKs directly from screen or component files
- This makes it easy to swap providers without touching UI code

### Supabase conventions (if chosen)
- Use Row Level Security (RLS) — every table must have policies
- Auth via `supabase.auth.signUp` / `signInWithPassword` / `signOut`
- Store watch lists and reviews in named tables — see Data model below
- Use `supabase-js` v2 client only

### Firebase conventions (if chosen)
- Use Firestore (not Realtime Database)
- Auth via Firebase Auth with email/password
- Structure Firestore as: `users/{uid}/watchlist/`, `users/{uid}/watched/`, `users/{uid}/reviews/`
- Use Firebase Security Rules — never expose data without auth checks

---

## Watchmode API

- Base URL: `https://api.watchmode.com/v1/`
- API key is stored in `.env` as `WATCHMODE_API_KEY` — never hardcode it
- All Watchmode calls must go through `src/services/watchmode.js` — do not call the API directly from components or screens
- Key endpoints to use:

| Purpose | Endpoint |
|---|---|
| Search titles | `GET /search/?search_field=name&search_value={query}` |
| Title details | `GET /title/{id}/details/` |
| Streaming sources | `GET /title/{id}/sources/` |
| List titles (trending) | `GET /list-titles/` |

- Cache search results and streaming sources — they don't change often and Watchmode has rate limits on the free tier
- Always handle the case where streaming sources are empty (show "Not currently available to stream")
- Country filtering: pass `region=GB` (or user's region) to `/sources/` where applicable

---

## Data model

Regardless of BaaS provider, the app needs these collections / tables:

### `users`
| Field | Type | Notes |
|---|---|---|
| `id` | string | Auth UID |
| `email` | string | |
| `created_at` | timestamp | |

### `watchlist`
| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `user_id` | string | FK to users |
| `title_id` | string | Watchmode title ID |
| `title_name` | string | Cached for display |
| `poster_url` | string | Cached for display |
| `added_at` | timestamp | |

### `watched`
Same schema as `watchlist`, with an additional `watched_at` timestamp.

### `reviews`
| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `user_id` | string | FK to users |
| `title_id` | string | Watchmode title ID |
| `title_name` | string | Cached for display |
| `rating` | integer | 1–5 |
| `body` | string | Optional text review |
| `is_public` | boolean | Controls visibility |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

## Coding conventions

### General
- Use TypeScript (or typed Dart for Flutter) — no untyped JS
- All new files must have a single, clear responsibility
- No magic numbers — use named constants in `src/utils/constants.js`
- All user-facing strings must be defined in a constants or i18n file (even if not localised yet)
- Never store secrets in source code — use `.env` and the platform's secure storage for tokens

### Naming
- Files: `camelCase.js` for utilities, `PascalCase.jsx` for components
- Functions: `camelCase`, descriptive verbs (`fetchTitleById`, `addToWatchlist`)
- Constants: `SCREAMING_SNAKE_CASE`
- Supabase / Firestore collections: `snake_case`

### Error handling
- Every API call must have a try/catch or `.catch()` handler
- Show user-friendly error messages — never expose raw API error strings to the UI
- Log errors to the console in development; use a logging service (e.g. Sentry) in production

### Auth guards
- All screens except Home, Search, and Title Detail must require authentication
- Redirect unauthenticated users to the Login screen
- Watch List, Watched, and Review actions must check auth state before proceeding

---

## User stories reference

When implementing a feature, find its story ID and use it in your branch name and commit messages.

| Epic | Story IDs |
|---|---|
| Authentication | US-101 to US-105 |
| Search & Discovery | US-201 to US-206 |
| Where to Watch | US-301 to US-305 |
| Watch List & Watched | US-401 to US-407 |
| Reviews | US-501 to US-507 |

Full stories are in [CineFind_User_Stories.md](./CineFind_User_Stories.md).

**MVP priority** — implement these first: US-101–103, US-201–204, US-301–303, US-401–405, US-501–503.

---

## Design constraints

Agents must respect the agreed design system when generating UI code:

- **Primary colour**: `#378ADD` (Blue 400) — use for primary buttons and active nav states
- **Confirmation colour**: `#1D9E75` (Teal 400) — use for "Watched" and saved states
- **Border radius**: 6px on cards and buttons — sharp and structured, not rounded/bubbly
- **Ratings**: always displayed as 1–5 stars — never numeric scores or thumbs
- **Streaming logos**: icons only on cards — no text labels next to logos on cards (text allowed on detail page)
- **Bottom navigation tabs**: Home, Search, My Lists, Profile — in that order, no others
- **Card content**: poster + title + star rating + streaming logos + save button — do not add or remove elements without approval

---

## What agents should NOT do

- Do not install additional state management libraries without confirming with the team
- Do not add any analytics or tracking SDKs not already listed in `package.json`
- Do not use `any` type in TypeScript
- Do not write raw SQL — use the Supabase client or Firestore SDK methods
- Do not make Watchmode API calls from UI components — always go through `src/services/watchmode.js`
- Do not commit `.env` files or any file containing API keys
- Do not add new bottom navigation tabs beyond the four agreed ones
- Do not change the rating system from 1–5 stars to any other format
