# Deploy the Guide API to Google Cloud Run

This gets your Spiritual Guide API running at a **public URL** so the app works for anyone (e.g. when you send an APK to a friend).

## What you need

- A **Google Cloud project** with billing enabled (same one you use for Vertex AI).
- **gcloud CLI** installed and logged in:  
  [Install gcloud](https://cloud.google.com/sdk/docs/install) then run:
  ```bash
  gcloud auth login
  gcloud config set project YOUR_PROJECT_ID
  ```

## 1. Enable APIs

In the same project you use for Vertex AI, enable:

- **Cloud Run API**
- **Cloud Build API** (so Google can build your Docker image)

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com
```

## 2. Allow Cloud Run to use Vertex AI

Cloud Run runs your container with a **service account**. That account needs permission to call Vertex AI.

1. In [Cloud Console](https://console.cloud.google.com/) → **IAM & Admin** → **IAM**.
2. Find the **Cloud Run service account** (often `PROJECT_NUMBER-compute@developer.gserviceaccount.com`, or the one you chose for the Cloud Run service).
3. Give it the role **Vertex AI User** (or **Vertex AI Admin** if you prefer).

Alternatively, when you first deploy, Cloud Run may use the **default compute service account**. Grant that account **Vertex AI User** in the same project.

## 3. Deploy from source

From the **spiritual-app** folder (the one that contains `Dockerfile` and `server/`):

```bash
cd path/to/spiritual-app

gcloud run deploy soulstride-guide-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID,GOOGLE_CLOUD_LOCATION=us-central1,GEMINI_MODEL=gemini-2.0-flash"
```

- Replace **`YOUR_PROJECT_ID`** with your real GCP project ID (the one in `server/.env` locally).
- **`--allow-unauthenticated`** lets the app (and your friend’s phone) call the API without signing in. If you want only logged-in users to call it, omit this and use auth (e.g. API key or IAM) instead.
- **`--region`** can be another region (e.g. `us-east1`); keep it close to where your users are if you like.

The first time, Cloud Build will build the image from the `Dockerfile` and then deploy it. This can take a few minutes.

When it finishes, you’ll see something like:

```text
Service [soulstride-guide-api] revision has been deployed and is serving 100 percent of traffic.
Service URL: https://soulstride-guide-api-XXXXX-uc.a.run.app
```

That **Service URL** is your **public API base URL**.

## 4. Use that URL in the app

When you **build the APK** (or any production build), point the app at this URL:

1. In **spiritual-app**, create or edit **`.env`** (or set the variable in EAS/Expo build config):
   ```env
   EXPO_PUBLIC_GUIDE_API_URL=https://soulstride-guide-api-XXXXX-uc.a.run.app
   ```
   Use the **exact** Service URL from the deploy step (no trailing slash, no `/api/guide`).

2. **Build the app** (e.g. EAS):
   ```bash
   eas build --platform android --profile production
   ```
   The built APK will call the Cloud Run URL, so it will work for you and for your friend.

For **local development**, keep using your PC URL (e.g. `http://localhost:3001` or `http://YOUR_PC_IP:3001`) in `.env` when running `npx expo start`, and only switch to the Cloud Run URL when you do a production build for sharing.

## 5. Update the service (optional)

To redeploy after changing server or Python code:

```bash
cd path/to/spiritual-app
gcloud run deploy soulstride-guide-api --source . --region us-central1
```

To change env vars only (no new build):

```bash
gcloud run services update soulstride-guide-api \
  --region us-central1 \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID,GOOGLE_CLOUD_LOCATION=us-central1,GEMINI_MODEL=gemini-2.0-flash"
```

## Summary

| Step | What to do |
|------|------------|
| 1 | Enable Cloud Run + Cloud Build; grant Vertex AI User to the Cloud Run service account. |
| 2 | From `spiritual-app`: `gcloud run deploy soulstride-guide-api --source . --region us-central1 --allow-unauthenticated --set-env-vars "GOOGLE_CLOUD_PROJECT=..."`. |
| 3 | Copy the **Service URL** into `EXPO_PUBLIC_GUIDE_API_URL` and build the APK. |

After that, the API runs at a public URL and the APK you send to a friend will work.
