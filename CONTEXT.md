# Nexus — Project Context Brief

Paste this at the start of a new conversation to fully orient Claude on what has been built, how it works, and what decisions were made.

---

## What this is

**Nexus** is a student networking dashboard MVP. A university student signs in with their Google account, completes a short onboarding (major, target careers, target companies, locations, daily queue size), and the app surfaces 1–5 ranked connections from their network every day with one-click scheduling. The core value is curation and discipline — not building a new contact database.

The app is fully working and has been demoed. It is styled in **UVA colors** (Navy `#232D4B`, Orange `#E57200`) with **Playfair Display** serif headings and CSS Modules throughout (no Tailwind).

GitHub repo: `https://github.com/rtaylor003376-hash/Network.git`

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite (JavaScript — not TypeScript) |
| Styling | CSS Modules only. No Tailwind. |
| Auth + DB | Firebase Auth (Google provider) + Cloud Firestore |
| Backend | Node.js + Express (ES modules, `"type": "module"`) |
| CSV parsing | PapaParse |
| AI | Anthropic Claude API (`claude-haiku-4-5-20251001`) |

---

## Critical architectural principle

All external dependencies are behind **service interfaces** with two implementations each — a mock and a real one. A single env flag (`VITE_USE_MOCKS` in `frontend/.env`) switches the entire app between mock and real services.

```
frontend/src/services/serviceFactory.js   ← single switch point
  ConnectionsImporter  →  MockConnectionsImporter  |  LinkedInCsvImporter
  CalendarService      →  MockCalendarService       |  GoogleCalendarService
  AiService            →  MockAiService             |  ClaudeAiService
```

With `VITE_USE_MOCKS=true` the app runs 100% offline with seeded data and is fully demo-able. With `VITE_USE_MOCKS=false` everything is real.

---

## What is fully built and working

### Frontend (`frontend/src/`)

**Auth + routing** (`App.jsx`, `context/AuthContext.jsx`)
- Firebase Google Sign-In with `calendar.events` OAuth scope
- `googleAccessToken` is captured at sign-in and exposed from `AuthContext`
- `user.getIdToken()` used at call time to get Firebase ID token
- Route guard redirects unauthenticated users to `/login` and incomplete-onboarding users to `/onboarding`

**Onboarding wizard** (`components/onboarding/`)
- 5 steps: Major, Desired Careers (multi-select with free-text), Locations, Target Companies, Queue Size (1–5)
- Writes to `users/{uid}` in Firestore on completion

**Dashboard** (`components/dashboard/`)
- `DailyQueue` — hero section showing 1–5 ranked cards, refreshes daily
- `ConnectionCard` — shows name (serif), role, company, match reason pill, match score bar, orange left-border on hover. Actions: Schedule a call (primary), Email, Snooze (7 days), Dismiss
- `UpcomingMeetings` — sidebar list of scheduled calls with date block and Meet link
- `ProfileSummary` — sidebar showing user's targets, editable

**Connections tab** (`components/connections/`)
- All connections grouped by company → position, alphabetical
- Search by name/company/role, filter by status (new/queued/scheduled/met)

**Import flow** (`components/import/ImportFlow.jsx`)
- LinkedIn Connections.csv upload (drag-and-drop or file picker)
- Parser skips LinkedIn's preamble "Notes:" lines before the real header row
- Deduplication by LinkedIn URL, shows import summary

**Schedule modal** (`components/schedule/ScheduleModal.jsx`)
- Date/time picker, duration selector (15/30/45/60 min)
- Calls `CalendarService.createMeeting()` with both `firebaseIdToken` and `googleAccessToken`
- On success shows Meet link and updates connection status to `scheduled`

**Email system** (`components/email/`)
- `EmailTemplatesPage` — CRUD for reusable email templates stored in Firestore
- Templates use placeholders: `{{firstName}}`, `{{lastName}}`, `{{company}}`, `{{position}}`
- `ComposeEmailModal` — pick a template (auto-fills placeholders) or write from scratch. Has "Draft with AI" expandable section. Actions: Copy to clipboard, Open in email client (`mailto:`)

**AI chat** (`components/chat/ChatPanel.jsx`)
- Floating orange button (bottom-right) on every page
- Opens a chat panel; AI knows user's profile (careers, companies, locations)
- General networking coach: cold outreach, call questions, follow-up advice
- `Enter` to send, `Shift+Enter` for newline

**Shared** (`components/shared/`)
- `NavBar` — dark navy, Nexus logo (serif), links: Today / Network / Import / Templates
- `RotundaSVG` — code-only SVG architectural illustration of the UVA Rotunda, used on login screen right panel
- `LoadingSpinner`, `EmptyState`

### Services

**Ranking** (`services/ranking/rankConnections.js`) — pure function, no I/O
- Weights in `rankingWeights.js`: Company match 0.45, Career/role 0.35, Location 0.15, Freshness 0.05
- Eligibility: excludes `scheduled`, `met`, `dismissed`, `snoozedUntil > now`
- Marks surfaced connections `shownOn = today`, `status = queued`

**Mock data** (`data/mockConnections.js`) — ~25 realistic seed connections

### Backend (`backend/src/`)

- `index.js` — Express server, initializes Firebase Admin from `serviceAccountKey.json`, port 3001
- `middleware/verifyToken.js` — verifies Firebase ID token from `Authorization: Bearer` header
- `routes/calendar.js` — `POST /api/calendar/create-meeting`: uses `x-google-access-token` header to call Google Calendar REST API, creates event with `conferenceDataVersion=1` + `hangoutsMeet` Meet link, `sendUpdates=all` if attendee email present
- `routes/ai.js` — `POST /api/ai/chat` and `POST /api/ai/draft-email`: calls Claude API (`claude-haiku-4-5-20251001`), system prompt includes user's profile context

### Firestore data model

```
users/{uid}
  displayName, email, major, minor, gradYear
  desiredCareers: string[]
  targetCompanies: string[]
  desiredLocations: string[]
  dailyQueueSize: number (1–5, default 3)
  onboardingComplete: boolean
  createdAt

users/{uid}/connections/{connId}
  firstName, lastName, email, company, position, location
  linkedinUrl, connectedOn, source ('linkedin_csv')
  status: 'new' | 'queued' | 'scheduled' | 'met'
  matchScore, shownOn, dismissed, snoozedUntil, lastInteractionAt

users/{uid}/meetings/{meetingId}
  connectionId, scheduledAt, durationMins, meetLink
  calendarEventId, inviteStatus, notes, createdAt

users/{uid}/emailTemplates/{templateId}
  title, subject, body, createdAt
```

Security rules in `firestore.rules` — users can only access their own subtree. **Must be deployed to Firebase Console → Firestore → Rules → Publish.**

---

## Environment files

### `frontend/.env`
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com   ← must end in .com
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_USE_MOCKS=true   ← set false to enable real services
```

### `backend/.env`
```
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
GOOGLE_CLIENT_SECRET=...
ANTHROPIC_API_KEY=...
PORT=3001
```

`backend/serviceAccountKey.json` — Firebase service account JSON, downloaded from Firebase Console → Project Settings → Service Accounts. Never committed.

---

## Running locally

```bash
# Terminal 1
cd backend && npm run dev        # http://localhost:3001

# Terminal 2
cd frontend && npm run dev       # http://localhost:5173
```

---

## Design system

- **Colors:** Navy `#232D4B` (brand/structural), Orange `#E57200` (CTAs/actions), defined as `--color-brand` and `--color-accent` in `global.css`
- **Fonts:** `--font-serif: 'Playfair Display'` for headings/titles, `--font-sans: 'Inter'` for body
- **Radii:** Sharp — sm: 3px, md: 6px, lg: 10px
- **No Tailwind** — prior v4 config issues; CSS Modules only

---

## What is explicitly out of scope (clean seams left)

- AI email drafting is wired; a more sophisticated `EmailService` interface seam exists for future expansion
- `ZoomCalendarService` stub interface left for later (Meet only for now)
- University alumni directory as a data source (`ConnectionsImporter` interface is the seam)
- Automated follow-up nudges
- Persisting chat history to Firestore

---

## Known things to watch out for

- `VITE_FIREBASE_AUTH_DOMAIN` **must** end in `.firebaseapp.com` — missing `.com` causes a silent iframe auth failure
- Firestore rules must be **manually published** in Firebase Console after any change to `firestore.rules`
- The Google Calendar route expects **two separate tokens**: `Authorization: Bearer <firebase-id-token>` and `x-google-access-token: <google-oauth-token>`
- Backend Firebase Admin is initialized from `serviceAccountKey.json` in `backend/src/index.js` — the server will crash on start if this file is missing
- `VITE_USE_MOCKS` is checked as `!== 'false'` so any value other than the string `'false'` activates mocks
