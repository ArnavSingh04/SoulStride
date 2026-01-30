import os
import re
import json
import time
import uuid
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

from google import genai

# -----------------------------
# Config
# -----------------------------
PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "project-45e7f38c-dbb5-44ae-beb")
LOCATION = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")

MODEL_TAGGER = os.environ.get("GEMINI_MODEL_TAGGER", "gemini-2.0-flash")
MODEL_WRITER = os.environ.get("GEMINI_MODEL_WRITER", "gemini-2.0-flash")

INPUT_FILE = os.environ.get("SGGS_INPUT", "sggs.json")
OUTPUT_FILE = os.environ.get("LESSONS_OUTPUT", "lessons.json")

# Lesson grouping
LESSON_PAU_MIN = 1          # ✅ changed: minimum can be 1
LESSON_PAU_TARGET_MIN = 2   # target 2–3 pauris normally
LESSON_PAU_TARGET_MAX = 3

# How many lessons per API call (batching)
LESSONS_PER_CALL = 8  # 8–10 is usually stable for strict JSON output

# Throttling
SLEEP_BETWEEN_CALLS_SEC = 0.25

# Pauri boundary marker (commonly appears as ||1||)
PAURI_RE = re.compile(r"\|\|\s*\d+\s*\|\|")

# IMPORTANT chunk detection (to allow 1-pauri lessons for key openings)
IMPORTANT_PATTERNS = [
    # Punjabi / Gurmukhi common Ik Onkar forms:
    r"ੴ",
    r"੧ਓ",
    r"੧੦",  # sometimes OCR-ish or font variants
    # Transliteration / English common signals:
    r"\bik[-\s]?o?nkaar\b",
    r"One Universal Creator God",
    r"By Guru'?s Grace",
    r"\bMool Mantar\b",
]

IMPORTANT_RE = re.compile("|".join(IMPORTANT_PATTERNS), re.IGNORECASE)

# Dynamic tag validation
TAG_ALLOWED_RE = re.compile(r"^[a-z0-9][a-z0-9_\-]{1,24}$")  # 2–25 chars, simple safe slug


# -----------------------------
# Helpers: parsing SGGS -> pauris
# -----------------------------
@dataclass
class Line:
    ang: int
    line_no: int
    punjabi: str
    english: str
    transliteration: str

@dataclass
class Pauri:
    pauri_index: int   # sequential index in our parsing flow
    ang_start: int
    ang_end: int
    lines: List[Line]

def load_pages(path: str) -> List[Dict[str, Any]]:
    """Load SGGS pages from JSON file."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ Input file not found: {path}")
        print(f"💡 Set SGGS_INPUT environment variable or ensure '{path}' exists")
        raise
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in {path}: {e}")
        raise

def normalize_line(obj: Dict[str, Any]) -> Optional[Line]:
    try:
        ang = int(obj.get("ang", obj.get("pageNumber", 0)) or 0)
        line_no = int(obj.get("line", 0) or 0)
        punjabi = (obj.get("punjabi") or "").strip()
        english = (obj.get("english") or "").strip()
        translit = (obj.get("transliteration") or "").strip()
        if not punjabi and not english and not translit:
            return None
        return Line(ang=ang, line_no=line_no, punjabi=punjabi, english=english, transliteration=translit)
    except Exception:
        return None

def flatten_lines(pages: List[Dict[str, Any]]) -> List[Line]:
    out: List[Line] = []
    for page in pages:
        for raw in page.get("lines", []):
            ln = normalize_line(raw)
            if ln:
                out.append(ln)
    out.sort(key=lambda x: (x.ang, x.line_no))
    return out

def is_pauri_boundary(line: Line) -> bool:
    # boundary marker may appear in Punjabi, transliteration, or English
    return bool(PAURI_RE.search(line.punjabi) or PAURI_RE.search(line.transliteration) or PAURI_RE.search(line.english))

def split_into_pauris(lines: List[Line]) -> List[Pauri]:
    pauris: List[Pauri] = []
    buf: List[Line] = []
    idx = 0
    for ln in lines:
        buf.append(ln)
        if is_pauri_boundary(ln):
            idx += 1
            pauris.append(Pauri(
                pauri_index=idx,
                ang_start=buf[0].ang,
                ang_end=buf[-1].ang,
                lines=buf
            ))
            buf = []
    if buf:
        idx += 1
        pauris.append(Pauri(
            pauri_index=idx,
            ang_start=buf[0].ang,
            ang_end=buf[-1].ang,
            lines=buf
        ))
    return pauris

def pauri_contains_important(p: Pauri) -> bool:
    # Search across Punjabi + English + transliteration for importance signals
    for ln in p.lines:
        blob = f"{ln.punjabi}\n{ln.transliteration}\n{ln.english}"
        if IMPORTANT_RE.search(blob):
            return True
    return False

def group_pauris_into_lessons(pauris: List[Pauri]) -> List[List[Pauri]]:
    """
    Default: 2–3 pauris per lesson.
    Special: allow 1-pauri lessons for important segments (e.g., Mool Mantar).
    """
    lessons: List[List[Pauri]] = []
    i = 0
    while i < len(pauris):
        p = pauris[i]

        # ✅ Special case: important chunk -> 1 pauri lesson
        if pauri_contains_important(p) and p.ang_start == 1:
            lessons.append([p])
            i += 1
            continue

        # Normal grouping: target 2–3
        take = LESSON_PAU_TARGET_MAX
        group = pauris[i:i+take]

        # If remaining is small, still allow 1+ at end
        if len(group) < LESSON_PAU_TARGET_MIN:
            group = pauris[i:i+LESSON_PAU_MIN]

        lessons.append(group)
        i += len(group)

    return lessons

def pauri_text_block(p: Pauri) -> str:
    parts = []
    for ln in p.lines:
        parts.append(
            f"- [ang {ln.ang} line {ln.line_no}]\n"
            f"  punjabi: {ln.punjabi}\n"
            f"  transliteration: {ln.transliteration}\n"
            f"  english: {ln.english}\n"
        )
    return "\n".join(parts)


# -----------------------------
# Vertex AI (Gemini)
# -----------------------------
def make_client() -> genai.Client:
    """Create Vertex AI client with proper authentication."""
    try:
        return genai.Client(vertexai=True, project=PROJECT_ID, location=LOCATION)
    except Exception as e:
        print(f"❌ Failed to create Vertex AI client: {e}")
        print(f"💡 Ensure you have:")
        print(f"   - Set GOOGLE_CLOUD_PROJECT environment variable (current: {PROJECT_ID})")
        print(f"   - Set GOOGLE_CLOUD_LOCATION environment variable (current: {LOCATION})")
        print(f"   - Authenticated with 'gcloud auth application-default login'")
        print(f"   - Enabled Vertex AI API in your GCP project")
        raise

def safe_json_load(text: str) -> Any:
    """Safely parse JSON from model response, handling markdown code blocks."""
    try:
        text = text.strip()
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
        text = re.sub(r"\s*```$", "", text, flags=re.MULTILINE)
        return json.loads(text)
    except json.JSONDecodeError as e:
        print(f"⚠️  JSON parse error: {e}")
        print(f"⚠️  Response text (first 500 chars): {text[:500]}")
        raise

def normalize_tags(tags: Any) -> List[str]:
    if not isinstance(tags, list):
        return []
    out: List[str] = []
    for t in tags:
        if not isinstance(t, str):
            continue
        s = t.strip().lower()
        s = re.sub(r"\s+", "_", s)
        s = re.sub(r"[^a-z0-9_\-]", "", s)
        if TAG_ALLOWED_RE.match(s):
            out.append(s)
    seen = set()
    uniq = []
    for t in out:
        if t not in seen:
            uniq.append(t)
            seen.add(t)
    return uniq[:3]

def tag_pass(client: genai.Client, batch_payload: List[Dict[str, Any]], known_tags: List[str]) -> List[Dict[str, Any]]:
    prompt = f"""
You are tagging Sikh scripture lesson chunks for an educational app.

Return STRICT JSON array, same length as input.
Each output item:
{{
  "id": "<same id>",
  "tags": ["tag1","tag2","tag3"],
  "key_phrases": ["..."],
  "tone": "neutral"
}}

Guidelines for tags:
- Prefer concise conceptual themes found in SGGS (e.g., oneness, truth, hukam, ego, naam, maya, fearlessness, compassion, humility, remembrance, detachment, service, gratitude).
- You MAY introduce new tags if needed, but keep them short and general.
- Avoid niche, long, or overly specific tags.
- Use ONLY English meanings provided; do NOT translate Punjabi; do NOT add history or new claims.

Known tags so far (optional guidance): {known_tags[:50]}

Input JSON:
{json.dumps(batch_payload, ensure_ascii=False)}
""".strip()

    resp = client.models.generate_content(
        model=MODEL_TAGGER,
        contents=prompt,
    )
    response_text = resp.text if hasattr(resp, "text") else str(resp)
    return safe_json_load(response_text)

def write_pass(client: genai.Client, batch_payload: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    schema_desc = """
Return STRICT JSON array. Each item must be:
{
  "lesson_id": "<id>",
  "source": {
    "pauri_indices": [1,2,3],
    "ang_range": {"start": 1, "end": 1}
  },
  "tags": ["..."],
  "blocks": [
    {"type":"guided_reading","text":"..."},
    {"type":"meaning","text":"..."},
    {
      "type":"situation",
      "scenario":"...",
      "choices":[{"id":"A","text":"..."},{"id":"B","text":"..."}],
      "best_choice":"A",
      "why":"..."
    },
    {"type":"check","question":"...","answer":"..."},
    {"type":"close","text":"..."}
  ]
}
""".strip()

    prompt = f"""
You create short, respectful, Duolingo-like lessons for Sikh scripture.

IMPORTANT RULES:
- Use ONLY the provided English meanings for interpretation. Do NOT re-translate Punjabi.
- Do NOT add new factual claims, history, or doctrine beyond what is clearly implied by the English meanings.
- Tone: neutral, contemplative, non-judgmental. Avoid moralizing ("must/should") language.
- Situations must be everyday, safe, non-political, non-violent, non-sexual, non-criminal.
- Keep each text field short (1–3 sentences).
- Output MUST be valid JSON, no extra commentary.

Lesson skeleton (always):
1) guided_reading (1–2 sentences: what is conveyed)
2) meaning (2–4 sentences: plain explanation)
3) situation (2–3 sentences + A/B + 1 sentence why tied to tags)
4) check (one simple Q&A)
5) close (one short takeaway)

You will receive a JSON array; generate lessons for each element.
{schema_desc}

Input JSON:
{json.dumps(batch_payload, ensure_ascii=False)}
""".strip()

    resp = client.models.generate_content(
        model=MODEL_WRITER,
        contents=prompt,
    )
    response_text = resp.text if hasattr(resp, "text") else str(resp)
    return safe_json_load(response_text)


# -----------------------------
# Main pipeline
# -----------------------------
def build_batches(lesson_groups: List[List[Pauri]]) -> List[List[Dict[str, Any]]]:
    batches: List[List[Dict[str, Any]]] = []
    current: List[Dict[str, Any]] = []

    for group in lesson_groups:
        lesson_id = str(uuid.uuid4())
        ang_start = min(p.ang_start for p in group)
        ang_end = max(p.ang_end for p in group)
        pauri_indices = [p.pauri_index for p in group]

        english_only = []
        for p in group:
            for ln in p.lines:
                if ln.english:
                    english_only.append(ln.english)

        payload = {
            "id": lesson_id,
            "source": {"pauri_indices": pauri_indices, "ang_range": {"start": ang_start, "end": ang_end}},
            "english_meanings": english_only[:60],
            "full_text": [pauri_text_block(p) for p in group],
        }

        current.append(payload)
        if len(current) >= LESSONS_PER_CALL:
            batches.append(current)
            current = []

    if current:
        batches.append(current)

    return batches

def main():
    print("🚀 Starting lesson creation pipeline...")
    print(f"📁 Input file: {INPUT_FILE}")
    print(f"📁 Output file: {OUTPUT_FILE}")
    print(f"☁️  Project: {PROJECT_ID}, Location: {LOCATION}")
    print(f"🤖 Models: Tagger={MODEL_TAGGER}, Writer={MODEL_WRITER}\n")

    pages = load_pages(INPUT_FILE)
    lines = flatten_lines(pages)
    pauris = split_into_pauris(lines)
    lesson_groups = group_pauris_into_lessons(pauris)
    batches = build_batches(lesson_groups)

    if not batches:
        print("⚠️  No batches to process. Check your input file.")
        return

    print(f"Loaded pages: {len(pages)}")
    print(f"Flattened lines: {len(lines)}")
    print(f"Detected pauris: {len(pauris)}")
    print(f"Lesson groups (1–3 pauris each, important may be 1): {len(lesson_groups)}")
    print(f"Batches (<= {LESSONS_PER_CALL} lessons per call): {len(batches)}")

    client = make_client()

    try:
        all_lessons: List[Dict[str, Any]] = []
        known_tags_registry: List[str] = [
            "hukam","haumai","naam","maya","seva","sat","sangat","vairag","kirpa","gian",
            "prem","nimrata","oneness","truth","fearlessness","compassion","gratitude"
        ]

        for bi, batch in enumerate(batches, start=1):
            print(f"\nBatch {bi}/{len(batches)}: {len(batch)} lessons")

            # Pass 1: tags / key phrases
            tag_out_raw = tag_pass(
                client,
                [{"id": x["id"], "english_meanings": x["english_meanings"]} for x in batch],
                known_tags_registry
            )

            if not isinstance(tag_out_raw, list):
                raise ValueError(f"Expected list from tag_pass, got {type(tag_out_raw)}")

            tag_map: Dict[str, Dict[str, Any]] = {}
            for item in tag_out_raw:
                _id = item.get("id")
                if not _id:
                    continue
                tags = normalize_tags(item.get("tags"))
                key_phrases = item.get("key_phrases", [])
                if not isinstance(key_phrases, list):
                    key_phrases = []
                key_phrases = [x.strip()[:80] for x in key_phrases[:3] if isinstance(x, str) and x.strip()]

                tag_map[_id] = {"tags": tags, "key_phrases": key_phrases, "tone": "neutral"}

                for t in tags:
                    if t not in known_tags_registry:
                        known_tags_registry.append(t)

            # Pass 2: lesson generation
            writer_in = []
            for x in batch:
                t = tag_map.get(x["id"], {"tags": [], "key_phrases": [], "tone": "neutral"})
                writer_in.append({
                    "id": x["id"],
                    "source": x["source"],
                    "tags": t.get("tags", []),
                    "key_phrases": t.get("key_phrases", []),
                    "english_meanings": x["english_meanings"],
                    "full_text": x["full_text"],
                })

            lessons_out = write_pass(client, writer_in)

            if not isinstance(lessons_out, list):
                raise ValueError(f"Expected list from write_pass, got {type(lessons_out)}")

            for item in lessons_out:
                if "lesson_id" not in item and "id" in item:
                    item["lesson_id"] = item.pop("id")
                all_lessons.append(item)

            time.sleep(SLEEP_BETWEEN_CALLS_SEC)

        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(all_lessons, f, ensure_ascii=False, indent=2)

        print(f"\n✅ Successfully created {len(all_lessons)} lessons")
        print(f"✅ Wrote lessons to: {OUTPUT_FILE}")
        print(f"✅ Discovered {len(known_tags_registry)} unique tags")
        print(f"📋 Tags: {', '.join(known_tags_registry[:20])}{'...' if len(known_tags_registry) > 20 else ''}")
        print("\n💡 Next steps:")
        print("   - Review lessons.json for quality")
        print("   - Transform into Supabase tables (lessons + lesson_blocks)")
        print("   - Or store blocks in a JSONB column")
    finally:
        if hasattr(client, "close"):
            try:
                client.close()
            except Exception:
                pass

if __name__ == "__main__":
    main()
