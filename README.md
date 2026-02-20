# SoulStride

A structured spiritual growth and guided learning mobile application with AI-powered Q&A support, built with React Native (Expo), Supabase, and Google Vertex AI.

---

## 1. Code brief & major components

### Repository layout

```
SoulStride/
├── spiritual-app/          # Main app (Expo + React Native + server + AI)
│   ├── app/                # Expo Router screens (file-based routing)
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React context (auth, theme)
│   ├── data/               # Static/seed data and generated JSON
│   ├── lib/                # Supabase clients, DB service, schema
│   ├── server/             # Node.js API (Guide endpoint)
│   ├── scripts/            # DB migrations, Vertex AI scripts
│   ├── services/           # Auth, storage-scope
│   ├── assets/             # Images, fonts
│   ├── guide_vertex.py     # Spiritual Guide (Vertex AI) — stdin/stdout
│   ├── requirements.txt   # Python deps for Vertex (google-genai)
│   ├── app.json / eas.json # Expo & EAS build config
│   └── package.json        # App + migration scripts
└── README.md
```

### What each part does

| Folder / file | Purpose |
|---------------|--------|
| **`app/`** | All screens. `app/(tabs)/` = bottom tabs (Home, Journey, Prayers, Guide, Routine, Profile). `app/auth/` = login/signup. Root `_layout.tsx` wraps with `AuthProvider`, `ThemePreferenceProvider`, and Expo Router `Stack`. |
| **`components/`** | Shared UI: `learning-journey`, `lesson-viewer`, `block-renderer`, `prayer-list`, `guru-granth-sahib-reader`, themed text/view, etc. |
| **`contexts/`** | `AuthContext` (Supabase auth, session), `ThemePreferenceContext` (light/dark). |
| **`lib/`** | **`supabase.ts`** — client used by the app (AsyncStorage, auth). **`supabase-server.ts`** — client for Node/scripts (no storage). **`database.service.ts`** — all Supabase CRUD (holy books, prayers, lessons, progress). **`supabase-schema.sql`** — source of truth for DB schema. **`database.types.ts`** — TypeScript types for DB entities. |
| **`server/`** | Express app: `POST /api/guide` (body: `{ question }` → `{ reply }`). Spawns `guide_vertex.py` with question on stdin, reads reply from stdout. Uses `server/.env` for GCP/Vertex. |
| **`data/`** | Seed/static data: `prayers.ts` / `prayers.json`, `guruGranthSahib.ts`, `lessons.json`, `sggs.json`, `example-lesson.json`. Some migrations read from here to populate Supabase. |
| **`scripts/`** | **TypeScript:** `test-connection.ts`, `migrate-*.ts`, `create-tables.ts`, `check-lessons.ts`, `clear-lessons-data.ts`, `confirm-user-email.ts`, etc. **Python:** `lessonCreation.py` (Vertex AI lesson generator), `html_to_json.python` (data prep). Scripts use `lib/supabase-server.ts`. |
| **`services/`** | `auth.service.ts` (sign up/in, session, password reset), `storage-scope.ts` (auth-scoped storage). Both use `lib/supabase`. |
| **`guide_vertex.py`** | Spiritual Guide: reads one line from stdin, calls Vertex AI (Gemini), prints reply to stdout. Used by `server/index.js`. |

### How components interact

- **UI → data:** Screens import `database.service.ts` or `data/prayers` and call `getLessons`, `getPrayerById`, `getAllPrayers`, etc. Auth screens use `auth.service.ts`; rest of app uses `AuthContext` for session.
- **UI → Guide:** `app/(tabs)/guide.tsx` calls `POST ${GUIDE_API_URL}/api/guide` with `{ question }`. `GUIDE_API_URL` comes from `EXPO_PUBLIC_GUIDE_API_URL` or defaults to `localhost:3001` (iOS) / `10.0.2.2:3001` (Android emulator).
- **Server → Vertex:** `server/index.js` spawns `guide_vertex.py` (using `venv` Python), passes question via stdin, reads reply from stdout. No direct HTTP call to Vertex from the server — Vertex is used only inside the Python process.
- **Migrations:** Run with `npm run db:test`, `npm run migrate:prayers`, `npm run migrate:lessons-from-json`, etc. They use `supabase-server` and read from `data/` or JSON files, then write to Supabase.

### Adding basic frontend features

- **New screen:** Add a file under `app/` (e.g. `app/(tabs)/new-tab.tsx` or `app/settings.tsx`) and register in `app/(tabs)/_layout.tsx` or root `_layout.tsx` if needed.
- **New tab:** Add screen under `app/(tabs)/` and a tab entry in `app/(tabs)/_layout.tsx` with name, component, and options.
- **New API call to Supabase:** Add a function in `lib/database.service.ts` using `supabase.from('table').select/insert/update/delete`, then call it from your screen or component.
- **New UI block type (lessons):** Extend `components/block-renderer.tsx` (and any types in `lib/database.types.ts`) for the new `block_type` and `block_data` shape.

### Adding basic backend features

- **New HTTP endpoint:** In `server/index.js`, add e.g. `app.post('/api/your-route', handler)`. Use `express.json()` (already enabled) for JSON body. For auth, you can validate a token from the app if you pass it in headers.
- **New Vertex-based feature:** Either extend `guide_vertex.py` (e.g. different system instruction or model config) or add a new Python script and spawn it from the server the same way (stdin → request, stdout → response), and add a new route that calls it.

---

## 2. Supabase breakdown

### How the app connects to Supabase

- **App (client):** `lib/supabase.ts` creates the Supabase client with `createClient(supabaseUrl, supabaseAnonKey, { auth: { storage: AsyncStorage, ... } })`. Used everywhere in the app and in `services/auth.service.ts` and `contexts/AuthContext.tsx`.
- **Scripts / server-side:** `lib/supabase-server.ts` creates a client with the same URL and anon key but without AsyncStorage (for Node/migrations). All `scripts/*.ts` migrations and `scripts/test-connection.ts` use this.
- **Project URL (current):** `https://xehvbppisebbzwolyfxj.supabase.co`. Keys are in `lib/supabase.ts` and `lib/supabase-server.ts`. For production, move these to env vars (e.g. `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`) and use a `.env` that is not committed.

### What Supabase is used for

- **Auth:** Sign up, sign in, session, password reset, email confirmation. Supabase Auth stores users; the app uses `supabase.auth.*` and `AuthContext` to expose session state.
- **Database (PostgreSQL):** All content and progress:
  - **holy_books** — e.g. Guru Granth Sahib Ji.
  - **bani_lines** — lines from holy books (punjabi, english, transliteration, ang, etc.).
  - **prayers** + **prayer_lines** — prayers and their lines.
  - **lessons** + **lesson_blocks** — learning journey (Duolingo-like) and block content (scripture, explanation, question, etc.).
  - **lesson_progress** — per-user progress (lesson_id, completed, score, current_block_order).
- **RLS:** Row Level Security is enabled on all tables. Current policies allow public read and public write (suitable for development and migrations). For production, restrict writes to authenticated users or service role and tighten policies.

### Schema updates (how to handle them)

1. **Source of truth:** `lib/supabase-schema.sql` — full schema including tables, indexes, RLS, and policies.
2. **Apply changes:**
   - **Option A (recommended):** Edit `lib/supabase-schema.sql`, then in Supabase Dashboard → SQL Editor paste and run the **new** parts only (e.g. `ALTER TABLE ...`, new tables, new policies). Do not re-run the whole file blindly if it would drop objects; use incremental migrations.
   - **Option B:** For one-off fixes, keep small SQL files under `scripts/` (e.g. `scripts/update-lessons-schema.sql`, `scripts/update-prayer-schema.sql`, `scripts/fix-rls-policies.sql`) and run them manually in the SQL Editor.
3. **Scripts:** `scripts/create-tables.ts` tries to run SQL via RPC; typically you don’t have `exec_sql` in Supabase, so the usual path is: update `supabase-schema.sql`, then run the relevant SQL in the Dashboard. After schema changes, run migrations (e.g. `migrate:prayers`, `migrate:lessons-from-json`) if you added new tables or columns that need data.

### Database CRUD and working with the DB

- **From the app:** Use `lib/database.service.ts`. It exposes functions like `getAllHolyBooks`, `getHolyBookById`, `getAllPrayers`, `getPrayerById`, `searchPrayers`, `getBaniLinesByAng`, `getLessons`, `getLessonById`, `getLessonWithBlocks`, `saveLessonProgress`, `getLessonProgress`, etc. All use `supabase.from('...').select/insert/update/delete`.
- **From scripts:** Import `supabase` from `lib/supabase-server.ts` and use the same pattern: `supabase.from('lessons').select('*')`, `.insert([...])`, `.update({ ... }).eq('id', id)`, `.delete().eq('id', id)`.
- **Testing connection:** `npm run db:test` runs `scripts/test-connection.ts`, which hits `holy_books` and reports whether tables exist and rough counts for prayers and bani_lines. If tables don’t exist, it prints instructions to run `lib/supabase-schema.sql` in the Supabase SQL Editor.

### Existing scripts and workflows

- **Create schema (manual):** Open Supabase Dashboard → SQL Editor → paste `lib/supabase-schema.sql` (or the incremental part) → Run.
- **Test:** `npm run db:test`
- **Migrations (examples):**  
  `npm run migrate:prayers`, `npm run migrate:prayers:json`, `npm run migrate:jaap-sahib`, `npm run migrate:ggs`, `npm run migrate:ggs-lessons`, `npm run migrate:ggs-lessons-by-pauri`, `npm run migrate:sample-lesson`, `npm run migrate:template-lessons`, `npm run migrate:lessons-from-json`, `npm run migrate:lessons-from-json:clear` (clear then import from JSON).
- **Checks / cleanup:** `npm run check:lessons`, `npm run clear:lessons`, `npm run import:lessons`.
- **Auth (admin):** `SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/confirm-user-email.ts <email>` to confirm a user’s email (service role key from Supabase Dashboard → Settings → API).

---

## 3. Architecture & design

- **Mobile:** Single React Native (Expo) app with file-based routing (Expo Router). Tabs: Home, Journey (lessons), Prayers, Guide (AI Q&A), Routine, Profile. Auth and theme are global via context.
- **Data flow:** App reads content and progress from Supabase (via `database.service.ts`). AI answers go through your own backend: App → Node server → `guide_vertex.py` (Vertex AI) → reply back to app.
- **Backend:** Stateless Express server; no DB. It only proxies the Spiritual Guide: receives `question`, runs Python with Vertex, returns `reply`. GCP/Vertex config is in `server/.env` and passed into the Python subprocess.
- **Content pipeline:** Scripture/lessons can be authored via `scripts/lessonCreation.py` (reads e.g. `sggs.json`, writes `lessons.json`). Then `migrate:lessons-from-json` (or similar) loads that JSON into Supabase `lessons` and `lesson_blocks`. Prayers and holy book lines are migrated from `data/` and JSON via the other migrate scripts.
- **Design:** Themed UI (light/dark), reusable components, and a single source of truth for schema (`supabase-schema.sql`) and types (`database.types.ts`).

---

## 4. App deployment (Expo / EAS, Android & iOS)

### How you’re currently building the APK (Expo / EAS)

- **EAS Build** is used with config in `spiritual-app/eas.json`:
  - **preview** profile: internal distribution, Android builds as **APK** (`buildType: "apk"`), iOS non-simulator.
  - **production** profile: Android APK; submit config for store.
- **Commands (from `spiritual-app/`):**
  - `npm run build:android` → `eas build --platform android --profile preview`
  - `npm run build:ios` → `eas build --platform ios --profile preview`
  - `npm run build:all` → both platforms, preview.
  - Production: `npm run build:android:prod`, `npm run build:ios:prod`.
- **Expo project:** `app.json` holds `expo.name`, `slug`, `version`, `scheme`, and EAS `projectId`. Android package: `com.soulstride.spiritualapp`.
- **Guide API in builds:** For preview/production APKs, set `EXPO_PUBLIC_GUIDE_API_URL` to your deployed Guide server URL (e.g. your Cloud Run URL) so the app doesn’t point at localhost. Use `.env` or EAS environment variables so the built app has the correct API base URL.

### Doing it in the future

- **Android:** Keep using EAS Build with `buildType: "apk"` for internal/preview; use production profile and `eas submit` when publishing to Play Store (or continue sharing APK manually).
- **iOS:** Use EAS Build with the iOS profile, then `eas submit --platform ios` (or Transporter/App Store Connect). You’ll need an Apple Developer account, provisioning profiles, and certificates (EAS can manage these if configured).
- **Over-the-air (OTA) updates:** Consider Expo Updates (e.g. `expo-updates`) so you can push JS/assets changes without rebuilding native binaries for small fixes.

---

## 5. Server deployment (current and future)

### Current setup

- **Stack:** Node (Express) in `spiritual-app/server/`; Python script `guide_vertex.py` in `spiritual-app/`; Vertex AI (Gemini) used only inside the Python process.
- **Local run:** From `spiritual-app/`: ensure `server/.env` has GCP/Vertex vars; run server with `cd server && npm run start` (or `npm run dev` for watch). App uses `EXPO_PUBLIC_GUIDE_API_URL` or default localhost/10.0.2.2.
- **Container:** `spiritual-app/Dockerfile` builds a Node image that also installs Python, a venv, and `guide_vertex.py` + `requirements.txt`. The server runs with `node server/index.js`; it spawns the venv Python to run `guide_vertex.py`. Designed for **Google Cloud Run** (PORT default 8080).
- **Deployment:** Build the image (from `spiritual-app/`), push to Google Artifact Registry (or another registry), deploy to Cloud Run. Set env vars on Cloud Run: `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, `GEMINI_MODEL` (or `GEMINI_MODEL_WRITER`), and any other vars `guide_vertex.py` reads. No database on the server — only the Guide API.

### Future options

- Keep Cloud Run: same Dockerfile, scale to zero, attach a custom domain, use secrets for any keys.
- Alternatively host the same container on another provider (e.g. Railway, Render, Fly.io) and set PORT and GCP credentials in their env.
- If you add more endpoints or server-side DB access, keep using the same Express app and add routes; for Supabase, use the service role key only in server env, never in the client app.

---

## 6. General app setup for new devs

1. **Clone and install**
   - `git clone <repo> && cd SoulStride/spiritual-app`
   - `npm install`

2. **Environment**
   - Copy `.env.example` to `.env`.
   - Set `EXPO_PUBLIC_GUIDE_API_URL` if you’ll run the Guide API elsewhere (e.g. `http://YOUR_IP:3001` for a physical device). Leave unset to use default localhost/emulator URLs.

3. **Supabase**
   - Create a project at supabase.com (or use existing).
   - In Dashboard → SQL Editor, run the contents of `lib/supabase-schema.sql` (or the incremental parts if DB already exists).
   - Optionally point `lib/supabase.ts` and `lib/supabase-server.ts` at your project (or use env vars for URL and anon key). Then run `npm run db:test`. If you have seed data, run the migrate scripts you need (e.g. `npm run migrate:prayers`, `npm run migrate:lessons-from-json`).

4. **Guide API (Vertex AI)**
   - Python 3 + venv: `python -m venv venv`, then `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux).
   - `pip install -r requirements.txt`
   - `gcloud auth application-default login` (or equivalent so Vertex AI is authorized).
   - In `server/`, create `server/.env` with `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, and optionally `GEMINI_MODEL` or `GEMINI_MODEL_WRITER`.
   - Run server: `cd server && npm install && npm run start` (or `npm run dev`).

5. **Run the app**
   - From `spiritual-app/`: `npm run start` (Expo). Then press `a` for Android or `i` for iOS simulator, or scan QR for a device. Ensure device and dev machine are on the same network and `EXPO_PUBLIC_GUIDE_API_URL` points at your machine’s IP if using a physical device.

6. **EAS (builds)**
   - Install EAS CLI: `npm i -g eas-cli`, then `eas login`.
   - In `spiritual-app/`, run `eas build --platform android --profile preview` (or use the npm scripts above). For iOS, same with `--platform ios` after Apple setup.

---

## 7. Vertex AI (Spiritual Guide & lesson generation)

### Where Vertex is used

- **Spiritual Guide (in-app Q&A):** `guide_vertex.py` — one question in, one reply out. Used by the app via the Node server.
- **Lesson generation (offline/content pipeline):** `scripts/lessonCreation.py` — reads SGGS-style JSON, uses Vertex to tag and write lesson blocks, outputs `lessons.json` (then you migrate that into Supabase).

### How the Guide works (calls and responses)

- **From the app:** User types a question in the Guide tab. The app sends `POST ${GUIDE_API_URL}/api/guide` with body `{ "question": "..." }`. The server receives it and calls `callGuidePython(question)`.
- **In the server:** `server/index.js` spawns `guide_vertex.py` with the project’s venv Python, passes the question on stdin, and reads the full reply from stdout. No HTTP call to Google from Node — Vertex is used only inside Python.
- **In Python:** `guide_vertex.py` uses `google.genai.Client(vertexai=True, project=PROJECT_ID, location=LOCATION)` and `client.models.generate_content(model=MODEL, contents=question, config=config)`. Config includes `system_instruction`, `temperature`, `max_output_tokens`. The reply is printed to stdout and returned to the client as `{ reply: "..." }`.

### Env vars (Vertex / Gemini)

- **guide_vertex.py:** `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, `GEMINI_MODEL_WRITER` or `GEMINI_MODEL` (e.g. `gemini-2.0-flash`). The server passes these into the child process so they’re set even when the server is started from another directory.
- **lessonCreation.py:** Same project/location; `GEMINI_MODEL_TAGGER`, `GEMINI_MODEL_WRITER`; `SGGS_INPUT`, `LESSONS_OUTPUT` for file paths.

### Maintaining and changing the Guide

- **System prompt / behavior:** Edit `SYSTEM_INSTRUCTION` in `guide_vertex.py`. It currently describes a kind spiritual guide grounded in universal wisdom and Guru Granth Sahib Ji (compassion, truth, service, Naam, sangat); keep responses concise and supportive.
- **Model / params:** Change `MODEL` (env or default) or the `config` dict in `guide_vertex.py` (temperature, max_output_tokens, etc.). Redeploy the server (and restart locally) for changes to take effect.
- **Adding new AI features:** Either extend `guide_vertex.py` (e.g. different modes via a prefix or a second system instruction) or add a new Python script and a new Express route that spawns it the same way (stdin → request payload, stdout → response).

### lessonCreation.py (content pipeline)

- **Purpose:** Batch-generate lessons from scripture JSON (e.g. `sggs.json`) into `lessons.json` with deterministic IDs, checkpoints, and retries. Uses two models: one for tagging, one for writing blocks (e.g. guided_reading, meaning, reflection).
- **Run locally:** From `spiritual-app/` with venv active and ADC set (`gcloud auth application-default login`): set `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, optionally `SGGS_INPUT`, `LESSONS_OUTPUT`, `GEMINI_MODEL_TAGGER`, `GEMINI_MODEL_WRITER`, then `python scripts/lessonCreation.py`. Then use `npm run migrate:lessons-from-json` (or the appropriate migration) to load `lessons.json` into Supabase.

---

## Quick reference

| Task | Command / location |
|------|--------------------|
| Test Supabase | `npm run db:test` (from `spiritual-app/`) |
| Run app | `npm run start` (Expo) |
| Run Guide server | `cd server && npm run start` |
| Android APK (preview) | `npm run build:android` |
| iOS build (preview) | `npm run build:ios` |
| Migrate lessons from JSON | `npm run migrate:lessons-from-json` |
| Schema source | `lib/supabase-schema.sql` |
| Guide prompt / model | `guide_vertex.py` (SYSTEM_INSTRUCTION, MODEL, config) |
| Guide API URL (app) | `EXPO_PUBLIC_GUIDE_API_URL` in `.env` |

---

**Author:** Arnav Sethi — [GitHub](https://github.com/ArnavSingh04) · [LinkedIn](https://www.linkedin.com/in/arnav-singh-sethi/)
