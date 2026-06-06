# CineFind — User Stories
**Movie & Show Discovery App**
Version 1.0 · Mobile-First · Casual Viewers

---

## Project Overview

CineFind is a mobile-first movie and TV show discovery app targeting casual viewers. Users can search for titles, find out where to stream them via the Watchmode API, save content to personal lists, and write reviews. The app launches on mobile (iOS & Android) with web support to follow.

**Key integrations:**
- Watchmode API — streaming availability, title metadata, and search
- Auth system — secure login/logout and user account management
- Backend database — persistent watch lists, watched lists, and reviews

---

## Epic 1: Authentication
*Goal: Allow users to create accounts and securely log in and out.*

| ID | Role | I want to… | So that… | Priority |
|----|------|------------|----------|----------|
| US-101 | New User | register with email and password | I can save my personal lists and reviews | 🔴 High |
| US-102 | Returning User | log in with my credentials | I can access my saved data across sessions | 🔴 High |
| US-103 | Logged-in User | log out from the app | my account is secure when I'm done | 🔴 High |
| US-104 | User | reset my password via email | I can regain access if I forget my credentials | 🟡 Medium |
| US-105 | User | stay logged in between sessions | I don't have to sign in every time I open the app | 🟡 Medium |

---

## Epic 2: Search & Discovery
*Goal: Help users quickly find movies and shows they're interested in.*

| ID | Role | I want to… | So that… | Priority |
|----|------|------------|----------|----------|
| US-201 | User | search for a movie or show by title | I can quickly find what I'm looking for | 🔴 High |
| US-202 | User | see search results with poster, title, and year | I can easily identify the right title at a glance | 🔴 High |
| US-203 | User | tap a result to view its full detail page | I can learn more before deciding to watch it | 🔴 High |
| US-204 | User | see genre, synopsis, cast, and rating on the detail page | I have enough info to decide if I want to watch it | 🔴 High |
| US-205 | User | filter search results by type (movie or TV show) | I only see the content type I'm interested in | 🟡 Medium |
| US-206 | User | see trending or popular titles on the home screen | I can discover new content without searching | 🟡 Medium |

---

## Epic 3: Where to Watch (Watchmode Integration)
*Goal: Tell users exactly where they can stream, rent, or buy a title.*

| ID | Role | I want to… | So that… | Priority |
|----|------|------------|----------|----------|
| US-301 | User | see which streaming services carry a title | I know if I can watch it with my current subscriptions | 🔴 High |
| US-302 | User | see rent/buy options with prices | I can decide whether it's worth paying for | 🔴 High |
| US-303 | User | tap a streaming link to open the service | I can start watching immediately without searching elsewhere | 🔴 High |
| US-304 | User | see streaming availability for my country | results are relevant to where I actually live | 🟡 Medium |
| US-305 | User | see a badge if a title is leaving a service soon | I can prioritise watching it before it disappears | 🟢 Low |

---

## Epic 4: Watch List & Watched List
*Goal: Let users organise titles they want to see and have already seen.*

| ID | Role | I want to… | So that… | Priority |
|----|------|------------|----------|----------|
| US-401 | Logged-in User | add a title to my Watch List | I can keep track of things I want to watch later | 🔴 High |
| US-402 | Logged-in User | remove a title from my Watch List | my list stays tidy and relevant | 🔴 High |
| US-403 | Logged-in User | mark a title as Watched | it moves to my Watched list and off my Watch List | 🔴 High |
| US-404 | Logged-in User | view all titles in my Watch List | I can browse what I still need to watch | 🔴 High |
| US-405 | Logged-in User | view all titles in my Watched list | I can see my viewing history | 🔴 High |
| US-406 | Logged-in User | remove a title from my Watched list | I can correct mistakes or re-watch entries | 🟡 Medium |
| US-407 | Logged-in User | see a saved/watched indicator on titles | I can tell at a glance whether I've already saved a title | 🟡 Medium |

---

## Epic 5: Reviews
*Goal: Allow users to rate and review titles, with optional public sharing.*

| ID | Role | I want to… | So that… | Priority |
|----|------|------------|----------|----------|
| US-501 | Logged-in User | write a text review for a title | I can record my thoughts after watching | 🔴 High |
| US-502 | Logged-in User | give a star rating (1–5) to a title | I can rate it quickly without writing a review | 🔴 High |
| US-503 | Logged-in User | choose whether my review is public or private | I control who sees my opinions | 🔴 High |
| US-504 | Logged-in User | edit or delete my review | I can update my opinion or remove it | 🟡 Medium |
| US-505 | User | read public reviews on a title's detail page | I can see what other viewers thought before watching | 🟡 Medium |
| US-506 | User | see the average community rating for a title | I get a quick sense of its popularity | 🟡 Medium |
| US-507 | Logged-in User | see all my reviews in one place (profile) | I can look back at everything I've reviewed | 🟢 Low |

---

## Sample Acceptance Criteria

### US-201 — Search for a movie or show
- Given I am on the Search screen, when I type at least 2 characters, then results appear within 1 second.
- Results include poster image, title, release year, and content type (Movie / TV).
- If no results are found, a friendly empty state message is shown.
- Search works for both movies and TV shows.

### US-301 — See where to stream a title
- The title detail page displays a "Where to Watch" section powered by the Watchmode API.
- Each streaming option shows the platform logo and name.
- Rent/buy options include the price where available.
- Tapping a streaming option deep-links to the platform app or opens the browser.
- If no streaming data is available, a message states "Not currently available to stream".

### US-503 — Public vs private reviews
- When writing a review, a toggle lets the user choose "Public" or "Private".
- Private reviews are visible only to the author on their profile.
- Public reviews appear on the title's detail page for all users.
- The privacy setting can be changed at any time by editing the review.

---

## Suggested Release Phasing

| Phase | Stories | Focus |
|-------|---------|-------|
| MVP (v1.0) | US-101–103, US-201–204, US-301–303, US-401–405, US-501–503 | Core loop: sign up, search, find streaming, save lists, review |
| v1.1 | US-104–105, US-205–206, US-304, US-406–407, US-504–506 | Polish: password reset, filters, country availability, list management, community reviews |
| v1.2 | US-305, US-507 | Nice-to-haves: leaving-soon badges, review history page |
