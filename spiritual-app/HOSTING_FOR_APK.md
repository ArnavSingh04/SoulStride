# Host the Guide API so a shared APK works for everyone

When you send your app’s APK to a friend, their phone needs to reach **your** Guide API on the internet, not your computer. Do these two things:

1. **Deploy the server** to a public URL (e.g. Google Cloud Run).
2. **Build the APK** with that URL baked in via `EXPO_PUBLIC_GUIDE_API_URL`.

---

## Step 1: Deploy the server (one-time)

Use **Google Cloud Run** so the API is public and can use Vertex AI with the same GCP project.

1. **Install and log in to gcloud**  
   [Install gcloud](https://cloud.google.com/sdk/docs/install), then:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Enable APIs** (same project as Vertex AI):
   ```bash
   gcloud services enable run.googleapis.com cloudbuild.googleapis.com
   ```

3. **Give Cloud Run access to Vertex AI**  
   In [Cloud Console](https://console.cloud.google.com/) → **IAM & Admin** → **IAM**, find the **Cloud Run / default compute service account** and add role **Vertex AI User**.

4. **Deploy from `spiritual-app`** (folder that has `Dockerfile` and `server/`).  
   **PowerShell (Windows):** use one line (no `\`):
   ```powershell
   gcloud run deploy soulstride-guide-api --source . --region us-central1 --allow-unauthenticated --set-env-vars "GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID,GOOGLE_CLOUD_LOCATION=us-central1,GEMINI_MODEL=gemini-2.0-flash"
   ```  
   **Bash/macOS/Linux:** same flags, with `\` at end of each line for continuation.  
   Replace **`YOUR_PROJECT_ID`** with your real GCP project ID (same as in `server/.env`).

5. **Copy the Service URL** from the deploy output, e.g.:
   ```text
   Service URL: https://soulstride-guide-api-XXXXX-uc.a.run.app
   ```
   That is your **public API base URL** (no trailing slash, no `/api/guide`).

More detail: **[DEPLOY_CLOUD_RUN.md](./DEPLOY_CLOUD_RUN.md)**.

---

## Step 2: Build the APK with the hosted URL

The app reads `EXPO_PUBLIC_GUIDE_API_URL` at **build time**. So when you build the APK you give to friends, that build must use your Cloud Run URL.

1. In **spiritual-app**, create or edit **`.env`**:
   ```env
   EXPO_PUBLIC_GUIDE_API_URL=https://soulstride-guide-api-XXXXX-uc.a.run.app
   ```
   Use the **exact** Service URL from Step 1.

2. Build the APK (e.g. with EAS):
   ```bash
   eas build --platform android --profile production
   ```
   Or build locally; the important part is that this build runs **with** the `.env` that has `EXPO_PUBLIC_GUIDE_API_URL` set to your Cloud Run URL.

3. Share the APK. Anyone who installs it will use your hosted API, so Vertex AI will work for them too.

**Tip:** For **local development**, use a different URL in `.env` (e.g. `http://localhost:3001` or `http://YOUR_PC_IP:3001`) and only switch to the Cloud Run URL when you run a **production** build for sharing.

---

## Quick checklist

| Step | Action |
|------|--------|
| 1 | Enable Cloud Run + Cloud Build; grant **Vertex AI User** to Cloud Run’s service account. |
| 2 | From `spiritual-app`: run `gcloud run deploy soulstride-guide-api ...` and note the **Service URL**. |
| 3 | Set `EXPO_PUBLIC_GUIDE_API_URL=<Service URL>` in `spiritual-app/.env`. |
| 4 | Run `eas build --platform android --profile production` (or your production build). |
| 5 | Share the APK; friends will use your hosted Vertex AI. |

After this, your server is hosted at a public URL and the APK you send will use it, so friends can use the Spiritual Guide (Vertex AI) without running anything on your machine.
