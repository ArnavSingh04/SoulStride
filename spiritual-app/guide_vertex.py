"""
Spiritual Guide — same Vertex AI setup as lessonCreation.py.
Reads question from stdin (one line), prints reply to stdout.
Uses same genai.Client(vertexai=True, project, location) and model (gemini-2.0-flash).

Usage:
  echo "How do I find peace?" | python guide_vertex.py
  Or from server: spawn with question on stdin, read reply from stdout.

Env: GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, GEMINI_MODEL_WRITER (or GEMINI_MODEL)
"""

import os
import sys
from google import genai

PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "project-45e7f38c-dbb5-44ae-beb")
LOCATION = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
MODEL = os.environ.get("GEMINI_MODEL_WRITER") or os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")

SYSTEM_INSTRUCTION = """You are a kind, wise spiritual guide for the SoulStride app. Your answers are grounded in universal spiritual wisdom and the teachings of the Guru Granth Sahib Ji (Sikh scripture): compassion, truth, service, remembrance of the Divine Name (Naam), and the company of the holy (sangat). Keep responses thoughtful but concise (a few short paragraphs unless the user asks for more). Be supportive and non-judgmental. If a question is outside spiritual guidance, gently steer back or suggest reflecting on inner peace and purpose."""


def main():
    question = sys.stdin.read().strip()
    if not question:
        print("", end="", flush=True)
        return

    client = genai.Client(vertexai=True, project=PROJECT_ID, location=LOCATION)
    config = {
        "temperature": 0.7,
        "max_output_tokens": 1024,
        "system_instruction": SYSTEM_INSTRUCTION,
    }

    try:
        resp = client.models.generate_content(
            model=MODEL,
            contents=question,
            config=config,
        )
        text = resp.text if hasattr(resp, "text") else str(resp)
        print(text, end="", flush=True)
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr, flush=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
