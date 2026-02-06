/**
 * Spiritual Guide API — uses same Vertex AI setup as lessonCreation.py
 *
 * Calls guide_vertex.py (same genai.Client, project, location, model as lessonCreation.py).
 * Requires spiritual-app venv: pip install -r requirements.txt, gcloud auth application-default login
 *
 * Start: npm start  (or npm run dev for watch mode)
 * POST /api/guide  body: { question: string }  → { reply: string }
 */

import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Always load server/.env so GCP vars are set even when started from spiritual-app/
dotenv.config({ path: path.join(__dirname, ".env") });

const PORT = process.env.PORT || 3001;
const GOOGLE_CLOUD_PROJECT =
  process.env.GOOGLE_CLOUD_PROJECT || "project-45e7f38c-dbb5-44ae-beb";
const GOOGLE_CLOUD_LOCATION =
  process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
// gemini-1.5-flash returns 404 on Vertex; use 2.0
const GEMINI_MODEL = (process.env.GEMINI_MODEL || "gemini-2.0-flash").replace(
  /^gemini-1\.5-flash$/i,
  "gemini-2.0-flash"
);

// Paths: server is spiritual-app/server/, script and venv are in spiritual-app/
const APP_ROOT = path.resolve(__dirname, "..");
const GUIDE_SCRIPT = path.join(APP_ROOT, "guide_vertex.py");
const VENV_PYTHON =
  process.platform === "win32"
    ? path.join(APP_ROOT, "venv", "Scripts", "python.exe")
    : path.join(APP_ROOT, "venv", "bin", "python");

const app = express();

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

const VERTEX_TIMEOUT_MS = 55_000;

function callGuidePython(question) {
  return new Promise((resolve, reject) => {
    // Pass env explicitly so Python always gets GCP vars (server/.env may not load if cwd ≠ server/)
    // Override GEMINI_MODEL_WRITER too — guide_vertex.py checks it first and it may be set to gemini-1.5-flash elsewhere (404).
    const childEnv = {
      ...process.env,
      GOOGLE_CLOUD_PROJECT,
      GOOGLE_CLOUD_LOCATION,
      GEMINI_MODEL,
      GEMINI_MODEL_WRITER: GEMINI_MODEL
    };
    const child = spawn(VENV_PYTHON, [GUIDE_SCRIPT], {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: APP_ROOT,
      env: childEnv
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      reject(
        new Error(
          `Failed to run guide_vertex.py: ${err.message}. Is venv set up?`
        )
      );
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(stderr.trim() || `guide_vertex.py exited with code ${code}`)
        );
      } else {
        resolve(stdout);
      }
    });

    child.stdin.write(question, "utf8", () => {
      child.stdin.end();
    });
  });
}

app.post("/api/guide", async (req, res) => {
  const question = req.body?.question?.trim();
  if (!question) {
    return res
      .status(400)
      .json({ error: 'Missing or empty "question" in body.' });
  }

  console.log(
    "[guide] Request:",
    question.slice(0, 60) + (question.length > 60 ? "..." : "")
  );

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Vertex AI request timed out.")),
        VERTEX_TIMEOUT_MS
      )
    );
    const reply = await Promise.race([
      callGuidePython(question),
      timeoutPromise
    ]);

    const text = (reply || "").trim();
    if (!text) {
      console.error("[guide] Empty response from guide_vertex.py");
      return res.status(502).json({ error: "Empty response from model." });
    }
    console.log("[guide] Success, reply length:", text.length);
    return res.json({ reply: text });
  } catch (err) {
    console.error("[guide] Error:", err?.message || err);
    const status = err?.status === 401 ? 401 : err?.status === 403 ? 403 : 500;
    return res.status(status).json({
      error: err?.message || "Spiritual guide request failed."
    });
  }
});

app.get("/health", (_, res) => res.json({ ok: true }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Spiritual Guide API listening on http://0.0.0.0:${PORT}`);
  console.log(`  Local: http://localhost:${PORT}`);
  console.log(`  POST /api/guide  { "question": "..." }`);
  console.log(
    `  Vertex: project=${GOOGLE_CLOUD_PROJECT} location=${GOOGLE_CLOUD_LOCATION} model=${GEMINI_MODEL}`
  );
  console.log(
    `  (Set in server/.env if 404 or "no access"; start server from server/ or any dir.)`
  );
});
