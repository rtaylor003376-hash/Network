# Netspand — Student Networking Dashboard

A web app that helps students systematically work their professional network toward a target career. Every day it surfaces the highest-fit contacts from your LinkedIn connections, makes it one click to schedule a Google Meet call, and includes an AI networking coach to help with outreach.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite (JavaScript) |
| Styling | CSS Modules |
| Auth + Database | Firebase Auth (Google) + Cloud Firestore |
| Backend | Node.js + Express |
| CSV parsing | PapaParse |
| AI | Anthropic Claude API (claude-haiku) |

---

## Prerequisites

Make sure you have these installed before starting:

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **npm** (comes with Node)
- A **Google account** (for Firebase)
- A **Firebase project** (free tier is fine)

---

## Step 1 — Clone and install dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

---

## Step 2 — Firebase setup

You need to do four things in Firebase. All of them are free.

### 2a. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** and follow the steps
3. Once created, click **Add app** → choose **Web** (</>)
4. Register the app — you'll get a config object with these values. Keep this tab open.

### 2b. Set up the frontend environment file

```bash
cd frontend
cp .env.example .env
```

Open `frontend/.env` and fill in the values from the Firebase config object you just got:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

VITE_USE_MOCKS=true
```

> **Important:** Make sure `VITE_FIREBASE_AUTH_DOMAIN` ends in `.firebaseapp.com` (not just `.firebaseapp`). Missing the `.com` causes a silent auth failure.

### 2c. Enable Google Sign-In

1. In Firebase Console → your project → **Authentication** → **Sign-in method**
2. Click **Google** → toggle **Enabled** → save
3. Scroll down to **Authorized domains** and confirm `localhost` is listed

### 2d. Enable Firestore

1. In Firebase Console → **Firestore Database** → **Create database**
2. Choose **Start in production mode** → pick any region → done

### 2e. Deploy Firestore security rules

1. In Firebase Console → **Firestore Database** → **Rules** tab
2. Replace everything in the editor with the contents of `firestore.rules` from this repo
3. Click **Publish**

### 2f. Get the Firebase service account key (for the backend)

1. In Firebase Console → gear icon → **Project Settings** → **Service accounts** tab
2. Click **Generate new private key** → **Generate key**
3. A JSON file downloads — rename it `serviceAccountKey.json`
4. Place it at `backend/serviceAccountKey.json`

> Never commit this file. It is already in `.gitignore`.

---

## Step 3 — Backend environment file

```bash
cd backend
cp .env.example .env
```

Your `backend/.env` should look like this (fill in your values):

```
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
GOOGLE_CLIENT_SECRET=your_oauth_client_secret
ANTHROPIC_API_KEY=your_anthropic_key
PORT=3001
```

The `GOOGLE_CLIENT_SECRET` and `ANTHROPIC_API_KEY` are only needed for Phase 3 features (real Google Calendar and real AI). For running the app with mocks, you can leave them blank for now.

---

## Step 4 — Google Cloud setup (Phase 3 — real Calendar + AI)

Skip this section if you just want to run the app with mocks (`VITE_USE_MOCKS=true`).

### 4a. Enable Google Calendar API

1. Go to [console.cloud.google.com](https://console.cloud.google.com) — make sure you're in the same project linked to Firebase
2. Left menu → **APIs & Services** → **Library**
3. Search for **Google Calendar API** → click it → **Enable**

### 4b. Create an OAuth 2.0 Client ID

1. Left menu → **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Under **Authorized JavaScript origins** add: `http://localhost:5173`
5. Under **Authorized redirect URIs** add: `http://localhost:3001/auth/callback`
6. Click **Create**
7. Copy the **Client Secret** → paste it into `backend/.env` as `GOOGLE_CLIENT_SECRET`

### 4c. Get an Anthropic API key (for the AI coach)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account if needed → **API Keys** → **Create Key**
3. Copy the key → paste into `backend/.env` as `ANTHROPIC_API_KEY`

---

## Step 5 — Run the app

You need two terminals running at the same time.

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Should print: Backend running on http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Should print: Local: http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Using the app

### With mocks (default, no real APIs needed)

With `VITE_USE_MOCKS=true` in `frontend/.env`, the app runs fully offline with:
- 25 pre-seeded mock connections
- A mocked Google Calendar that returns a fake Meet link
- A mocked AI coach with pre-written networking responses

This is the best way to develop and demo without any API keys.

### Switching to real services

Change `frontend/.env`:
```
VITE_USE_MOCKS=false
```

This activates:
- **Real LinkedIn CSV import** — export your connections from LinkedIn (Settings → Data Privacy → Get a copy of your data → Connections), then upload the CSV on the Import tab
- **Real Google Calendar** — scheduling a call creates an actual Google Calendar event with a Meet link and sends an invite to the contact
- **Real AI coach** — the chat bubble and "Draft with AI" use Claude (requires `ANTHROPIC_API_KEY` in `backend/.env`)

---

## Project structure

```
student-network-dashboard/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/          # Login screen
│   │   │   ├── chat/          # AI chat panel (floating bubble)
│   │   │   ├── connections/   # Network tab (grouped by company)
│   │   │   ├── dashboard/     # Daily queue + connection cards
│   │   │   ├── email/         # Compose modal + templates page
│   │   │   ├── import/        # LinkedIn CSV upload flow
│   │   │   ├── onboarding/    # Multi-step setup wizard
│   │   │   ├── schedule/      # Schedule a call modal
│   │   │   └── shared/        # NavBar, LoadingSpinner, EmptyState
│   │   ├── context/           # Firebase Auth context
│   │   ├── firebase/          # Firestore config + collection refs
│   │   ├── hooks/             # useConnections, useMeetings, useEmailTemplates, etc.
│   │   ├── services/
│   │   │   ├── ai/            # MockAiService + ClaudeAiService
│   │   │   ├── calendar/      # MockCalendarService + GoogleCalendarService
│   │   │   ├── connections/   # MockConnectionsImporter + LinkedInCsvImporter
│   │   │   ├── ranking/       # rankConnections.js (pure function)
│   │   │   └── serviceFactory.js  # Single switch point for mock vs real
│   │   └── styles/            # CSS Modules
│   └── .env                   # Your local env vars (never commit)
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── calendar.js    # Google Calendar events.insert
│   │   │   └── ai.js          # Claude chat + email draft endpoints
│   │   ├── middleware/
│   │   │   └── verifyToken.js # Firebase ID token verification
│   │   └── index.js
│   ├── serviceAccountKey.json # Firebase service account (never commit)
│   └── .env                   # Your local env vars (never commit)
└── firestore.rules            # Security rules — deploy to Firebase Console
```

---

## Common errors

| Error | Fix |
|---|---|
| `Cannot find package 'dotenv'` | Run `npm install` in the `backend/` folder |
| `Failed to load resource: hostname could not be found` | Check `VITE_FIREBASE_AUTH_DOMAIN` ends in `.firebaseapp.com` |
| `Missing or insufficient permissions` | Re-publish `firestore.rules` in Firebase Console |
| `400` on sign-in | Enable Google Sign-In in Firebase Auth → Sign-in method |
| Backend crashes on start | Make sure `serviceAccountKey.json` is in the `backend/` folder |
