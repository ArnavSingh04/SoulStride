# Spiritual Guide — Vertex AI (OAuth / ADC)

The Spiritual Guide tab is powered by **Vertex AI Gemini** using your GCP project. The app does **not** call Vertex directly; a small **backend API** does, so your project credentials stay server-side.

## Architecture

1. **Backend** (`spiritual-app/server/`) — Express server that runs **guide_vertex.py** (Python) with the question on stdin and reads the reply from stdout.
2. **guide_vertex.py** — Same Vertex client and env vars as lessonCreation.py: `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, `GEMINI_MODEL_WRITER` or `GEMINI_MODEL` (default `gemini-2.0-flash`).
3. **App** — Guide tab sends the user’s question to the backend and shows the reply.

Your project ID is already set to `project-45e7f38c-dbb5-44ae-beb` in the server; you can override it with env vars.

## 1. GCP setup (one-time)

1. **Create/select a project** in [Google Cloud Console](https://console.cloud.google.com/) and note the **Project ID** (e.g. `project-45e7f38c-dbb5-44ae-beb`).
2. **Enable Vertex AI API**:  
   [Enable Vertex AI API](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com) → select your project → Enable.
3. **Authentication (choose one)**  
   - **Local dev (ADC):**  
     ```bash
     gcloud auth application-default login
     ```  
     Use the same Google account that has access to the project.  
   - **Production (service account):**  
     - Create a service account with “Vertex AI User” (or appropriate) role.  
     - Download a JSON key.  
     - Set `GOOGLE_APPLICATION_CREDENTIALS` to the path of that JSON when running the server.

## 2. Run the Spiritual Guide API (backend)

```bash
cd spiritual-app/server
npm install
npm start
```

The server loads `server/.env` if present (via `dotenv`). Copy `server/.env.example` to `server/.env` and set your **real GCP project ID** — the default in the example may be a placeholder.

Optional env (or in `server/.env`):

- `PORT` — default `3001`
- `GOOGLE_CLOUD_PROJECT` — your GCP project ID (default: `project-45e7f38c-dbb5-44ae-beb`)
- `GOOGLE_CLOUD_LOCATION` — e.g. `us-central1`
- `GEMINI_MODEL` — e.g. `gemini-2.0-flash`

For local ADC, no env vars are required if you’ve run `gcloud auth application-default login`.

The server listens on `http://localhost:3001` and exposes:

- `POST /api/guide` — body: `{ "question": "..." }` → `{ "reply": "..." }`
- `GET /health` — health check

## 3. Point the app at the API

- **Default:** The app uses `http://localhost:3001` if you don’t set anything (works for web and iOS simulator).
- **Android emulator:** The emulator’s “localhost” is itself. Use your machine’s IP or:
  - `EXPO_PUBLIC_GUIDE_API_URL=http://10.0.2.2:3001` (Android emulator → host)
- **Physical device or deployed API:** Set the base URL (no `/api/guide`), e.g.:
  - `EXPO_PUBLIC_GUIDE_API_URL=https://your-api.example.com`

Create a `.env` in `spiritual-app/` (or set in EAS/Expo config):

```env
EXPO_PUBLIC_GUIDE_API_URL=http://localhost:3001
```

Restart the Expo dev server after changing env vars.

## 4. Deploying the API (optional)

Deploy the `server/` app to any Node host (e.g. **Google Cloud Run**, Railway, Render):

- Set `GOOGLE_APPLICATION_CREDENTIALS` to the service account key path, or run on GCP (e.g. Cloud Run) so ADC picks up the default service account.
- Set `PORT` as required by the host (e.g. Cloud Run uses `8080`).
- In the app, set `EXPO_PUBLIC_GUIDE_API_URL` to the deployed API base URL.

## 5. Troubleshooting — Guide not working after ADC

Do these in order:

1. **Set your GCP project**
   - Copy `server/.env.example` to `server/.env`.
   - In `server/.env`, set `GOOGLE_CLOUD_PROJECT` to your **actual** GCP project ID (from Cloud Console, not the placeholder).
   - Optionally set `GOOGLE_CLOUD_LOCATION=us-central1` and `GEMINI_MODEL=gemini-2.0-flash`.

2. **Install server deps and start the API**
   ```bash
   cd spiritual-app/server
   npm install
   npm start
   ```
   You should see: `Spiritual Guide API listening on http://0.0.0.0:3001`.

3. **Test the Python script (Vertex/ADC)**
   In a **new** terminal:
   ```bash
   cd spiritual-app
   venv\Scripts\activate
   echo How do I find peace? | python guide_vertex.py
   ```
   If you get a permission or model error, fix GCP (Vertex AI API enabled, correct project). If you see a short reply, ADC and Vertex work.

4. **Test the API**
   ```bash
   curl -X POST http://localhost:3001/api/guide -H "Content-Type: application/json" -d "{\"question\": \"Hello\"}"
   ```
   You should get JSON with a `"reply"` field.

5. **Run the app**
   From `spiritual-app`: `npx expo start`. Open the Guide tab and ask something.
   - **Web / iOS simulator:** uses `http://localhost:3001` by default.
   - **Android emulator:** uses `http://10.0.2.2:3001` by default.
   - **Physical device:** set `EXPO_PUBLIC_GUIDE_API_URL=http://YOUR_PC_IP:3001` in `spiritual-app/.env` (e.g. `http://192.168.1.5:3001`), then restart Expo.

If the app shows "Network request failed", the device/simulator cannot reach the server (wrong URL or server not running). If the app shows a 500 or timeout, check the **server terminal** for the error from `guide_vertex.py` (e.g. wrong project, model, or quota).

**Physical phone times out:** On a real device, "localhost" is the phone, so the app must use your computer's IP. Create `spiritual-app/.env` with `EXPO_PUBLIC_GUIDE_API_URL=http://YOUR_PC_IP:3001` (run `ipconfig` to get your IPv4), then **restart Expo** (env is read at start). Same Wi‑Fi; if it still times out, allow port 3001 in Windows Firewall.

**404 / "not found or your project doesn't have access":** The server wasn’t loading `server/.env` when started from another directory, so the Python script used the wrong project. The server now always loads `server/.env` from the server folder and passes project/location/model to Python. Create `server/.env` from `server/.env.example` and set `GOOGLE_CLOUD_PROJECT` to your real GCP project ID. Restart the server and check the startup log for the line `Vertex: project=... location=... model=...`.

## Summary

| Step | What to do |
|------|------------|
| GCP | Enable Vertex AI API; use ADC (`gcloud auth application-default login`) or a service account. |
| Backend | Copy `server/.env.example` → `server/.env`, set `GOOGLE_CLOUD_PROJECT`; then `cd spiritual-app/server && npm install && npm start`. |
| App | Set `EXPO_PUBLIC_GUIDE_API_URL` if not using `http://localhost:3001` (e.g. Android emulator or production). |

“Vertex AI OAuth” here means **authenticating the backend to GCP** via ADC (OAuth2 flow from `gcloud auth application-default login`) or a service account; the app only talks to your backend, not to Vertex directly.
