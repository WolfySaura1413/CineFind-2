# CineFind 🎬

A bright, mobile-first app for casual viewers to discover movies and TV shows, find where to stream them, and keep track of what they want to watch and have already seen.

---

## What it does

- **Search** for any movie or TV show powered by the [Watchmode API](https://api.watchmode.com/)
- **Find where to watch** — streaming availability, rent/buy options, and direct links to platforms
- **Save titles** to a personal Watch List or Watched list
- **Review & rate** titles with 1–5 stars, with the option to keep reviews private or share them publicly
- **Discover** trending and popular titles without needing to search

---

## Tech stack

| Layer | Technology |
|---|---|
| Mobile (primary) | TBD — React Native or Flutter recommended |
| Web | TBD — to follow mobile launch |
| Backend / Auth / Database | Firebase or Supabase (BaaS) |
| Movie & streaming data | [Watchmode API](https://api.watchmode.com/) |

> The mobile framework has not been finalised. See [AGENTS.md](./AGENTS.md) for framework guidance and conventions to follow once a decision is made.

---

## Project structure (proposed)

```
cinefind/
├── src/
│   ├── screens/          # One folder per screen (Home, Search, Detail, Lists, Profile)
│   ├── components/       # Shared UI components (TitleCard, StarRating, StreamingLogos…)
│   ├── hooks/            # Custom hooks (useSearch, useWatchlist, useAuth…)
│   ├── services/         # API clients (watchmode.js, auth.js, db.js)
│   ├── store/            # Global state (auth, lists, reviews)
│   └── utils/            # Helpers and constants
├── assets/               # Fonts, icons, images
├── .env.example          # Required environment variables (no secrets committed)
├── AGENTS.md             # AI agent instructions and coding conventions
└── README.md
```

---

## Getting started

### Prerequisites

- Node.js 18+ (if using React Native / Expo)
- A [Watchmode API key](https://api.watchmode.com/) — free tier available
- A Firebase or Supabase project set up with Auth and a database

### Environment variables

Copy `.env.example` to `.env` and fill in your keys:

```env
WATCHMODE_API_KEY=your_key_here
SUPABASE_URL=https://your-project.supabase.co      # or Firebase config
SUPABASE_ANON_KEY=your_anon_key_here
```

> Never commit `.env` to version control. It is listed in `.gitignore`.

### Install & run

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

---

## Key screens

| Screen | Description |
|---|---|
| Home / Discover | Search bar at the top, card feed of trending titles below |
| Search | Full-screen search with movie/TV filter |
| Title Detail | Poster, metadata, where to watch, save/watched buttons, reviews |
| My Lists | Toggle between Watch List and Watched list |
| Profile | Account info, review history, logout |

---

## Design system

- **Palette** — Blue 400 (`#378ADD`) primary, Teal 400 (`#1D9E75`) confirmation, light tints for tags and surfaces
- **Shape** — Sharp, structured edges. 6px border radius on cards and buttons
- **Cards** — Poster + title + star rating + streaming logos (icons only) + save button
- **Ratings** — 1–5 stars throughout (cards, detail page, reviews)
- **Navigation** — Bottom tab bar: Home, Search, My Lists, Profile

---

## Features by release

**MVP (v1.0)**
- Register, login, logout
- Search titles, view detail pages with streaming info
- Add to / view Watch List and Watched list
- Write a review with a star rating (public or private)

**v1.1**
- Password reset, persistent login
- Filter search by movie / TV
- Country-specific streaming availability
- Community reviews and average rating on detail pages

**v1.2**
- "Leaving soon" badges for expiring titles
- Full review history on profile page

---

## User stories

Full user stories are documented in [CineFind_User_Stories.md](./CineFind_User_Stories.md).

---

## Contributing

1. Branch from `main` using the format `feature/US-XXX-short-description`
2. One user story per branch
3. Open a pull request with the story ID in the title (e.g. `[US-201] Search by title`)
4. All PRs require at least one review before merging

---

## License

MIT
