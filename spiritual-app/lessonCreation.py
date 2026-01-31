"""
lessonCreation.py — Reliable SGGS -> Duolingo-like lesson generator (Vertex AI Gemini)

Goals:
- Deterministic lesson IDs (uuid5) so reruns resume cleanly
- Checkpoint after every successful chunk (lessons.json grows while running)
- JSON reliability:
  - Request JSON mode via response_mime_type="application/json"
  - Retries on JSON errors
  - If still failing, automatically split batches smaller until it works
  - If a single lesson keeps failing, skip it and continue (logged)

Usage:
  (venv) pip install google-genai
  (venv) gcloud auth application-default login
  (venv) set GOOGLE_CLOUD_PROJECT=...
  (venv) set GOOGLE_CLOUD_LOCATION=us-central1
  (venv) python lessonCreation.py

Env vars:
  SGGS_INPUT        (default: sggs.json)
  LESSONS_OUTPUT    (default: lessons.json)
  GEMINI_MODEL_TAGGER (default: gemini-2.0-flash)
  GEMINI_MODEL_WRITER (default: gemini-2.0-flash)
"""

import os
import re
import json
import time
import uuid
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Set, Tuple

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
LESSON_PAU_MIN = 1
LESSON_PAU_TARGET_MIN = 2
LESSON_PAU_TARGET_MAX = 3

# How many lessons per API call (batching)
LESSONS_PER_CALL = 8  # will auto-split down if JSON breaks

# Throttling
SLEEP_BETWEEN_CALLS_SEC = 0.20

# Pauri boundary marker (commonly appears as ||1||)
PAURI_RE = re.compile(r"\|\|\s*\d+\s*\|\|")

# IMPORTANT chunk detection (to allow 1-pauri lessons for key openings)
IMPORTANT_PATTERNS = [
    r"ੴ",
    r"੧ਓ",
    r"੧੦",
    r"\bik[-\s]?o?nkaar\b",
    r"One Universal Creator God",
    r"By Guru'?s Grace",
    r"\bMool Mantar\b",
]
IMPORTANT_RE = re.compile("|".join(IMPORTANT_PATTERNS), re.IGNORECASE)

# Dynamic tag validation (2–25 chars, safe slug)
TAG_ALLOWED_RE = re.compile(r"^[a-z0-9][a-z0-9_\-]{1,24}$")


# -----------------------------
# Data structures
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
    pauri_index: int
    ang_start: int
    ang_end: int
    lines: List[Line]


# -----------------------------
# IO helpers
# -----------------------------
def load_pages(path: str) -> List[Dict[str, Any]]:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ Input file not found: {path}")
        print(f"💡 Set SGGS_INPUT env var or ensure '{path}' exists in the current folder.")
        raise
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in {path}: {e}")
        raise


def _safe_checkpoint_write(path: str, data: Any) -> None:
    """Atomic checkpoint write so file never ends up partially written."""
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, path)


def _load_existing_output(path: str) -> Tuple[List[Dict[str, Any]], Set[str]]:
    """Load lessons.json if present; returns (lessons, done_ids)."""
    if not os.path.exists(path):
        return [], set()
    try:
        with open(path, "r", encoding="utf-8") as f:
            loaded = json.load(f)
        if not isinstance(loaded, list):
            return [], set()
        done = set()
        for it in loaded:
            lid = it.get("lesson_id")
            if isinstance(lid, str) and lid:
                done.add(lid)
        return loaded, done
    except Exception as e:
        print(f"⚠️  Could not load existing {path}: {e}")
        return [], set()


# -----------------------------
# Parsing SGGS pages -> lines -> pauris
# -----------------------------
def normalize_line(obj: Dict[str, Any]) -> Optional[Line]:
    try:
        ang = int(obj.get("ang", obj.get("pageNumber", 0)) or 0)
        line_no = int(obj.get("line", 0) or 0)
        punjabi = (obj.get("punjabi") or "").strip()
        english = (obj.get("english") or "").strip()
        translit = (obj.get("transliteration") or "").strip()
        if not punjabi and not english and not translit:
            return None
        return Line(
            ang=ang,
            line_no=line_no,
            punjabi=punjabi,
            english=english,
            transliteration=translit,
        )
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
    return bool(
        PAURI_RE.search(line.punjabi)
        or PAURI_RE.search(line.transliteration)
        or PAURI_RE.search(line.english)
    )


def split_into_pauris(lines: List[Line]) -> List[Pauri]:
    pauris: List[Pauri] = []
    buf: List[Line] = []
    idx = 0
    for ln in lines:
        buf.append(ln)
        if is_pauri_boundary(ln):
            idx += 1
            pauris.append(Pauri(idx, buf[0].ang, buf[-1].ang, buf))
            buf = []
    if buf:
        idx += 1
        pauris.append(Pauri(idx, buf[0].ang, buf[-1].ang, buf))
    return pauris


def pauri_contains_important(p: Pauri) -> bool:
    for ln in p.lines:
        blob = f"{ln.punjabi}\n{ln.transliteration}\n{ln.english}"
        if IMPORTANT_RE.search(blob):
            return True
    return False


def group_pauris_into_lessons(pauris: List[Pauri]) -> List[List[Pauri]]:
    """
    Default: 2–3 pauris per lesson.
    Special: allow 1-pauri for important opening at ang 1.
    """
    lessons: List[List[Pauri]] = []
    i = 0
    while i < len(pauris):
        p = pauris[i]

        if pauri_contains_important(p) and p.ang_start == 1:
            lessons.append([p])
            i += 1
            continue

        group = pauris[i : i + LESSON_PAU_TARGET_MAX]
        if len(group) < LESSON_PAU_TARGET_MIN:
            group = pauris[i : i + LESSON_PAU_MIN]

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
# Deterministic lesson IDs (uuid5)
# -----------------------------
def deterministic_lesson_id(ang_start: int, ang_end: int, pauri_indices: List[int]) -> str:
    key = f"{ang_start}-{ang_end}-" + ",".join(map(str, pauri_indices))
    return str(uuid.uuid5(uuid.NAMESPACE_URL, key))


# -----------------------------
# Gemini helpers (JSON mode + retries)
# -----------------------------
def make_client() -> genai.Client:
    return genai.Client(vertexai=True, project=PROJECT_ID, location=LOCATION)


def safe_json_load(text: str) -> Any:
    """
    Parse JSON from model response.
    Tries to salvage by extracting outermost [] or {} if response contains extra junk.
    """
    text = (text or "").strip()

    # strip markdown fences if they appear
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\s*```$", "", text, flags=re.MULTILINE).strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # salvage attempt: trim to outermost array/object
        for lch, rch in (("[", "]"), ("{", "}")):
            s = text.find(lch)
            e = text.rfind(rch)
            if s != -1 and e != -1 and e > s:
                snippet = text[s : e + 1]
                try:
                    return json.loads(snippet)
                except json.JSONDecodeError:
                    pass
        raise


def _gen_json(client: genai.Client, model: str, prompt: str, *, temperature: float) -> Any:
    """
    Request JSON mode via response_mime_type. This is the single biggest reliability boost.
    """
    resp = client.models.generate_content(
        model=model,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "temperature": temperature,
        },
    )
    response_text = resp.text if hasattr(resp, "text") else str(resp)
    return safe_json_load(response_text)


def _gen_json_with_retries(
    client: genai.Client,
    model: str,
    prompt: str,
    *,
    attempts: int = 3,
    temperature: float = 0.2,
) -> Any:
    last_err: Optional[Exception] = None
    p = prompt
    for i in range(1, attempts + 1):
        try:
            # become stricter on subsequent attempts
            t = 0.0 if i > 1 else temperature
            return _gen_json(client, model, p, temperature=t)
        except Exception as e:
            last_err = e
            p = (
                p
                + "\n\nCRITICAL: Output MUST be VALID JSON ONLY. No prose. No markdown fences. "
                "No trailing commas. All strings must be properly escaped. Return the JSON array only."
            )
    raise last_err if last_err else RuntimeError("Unknown JSON generation failure")


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
    # unique + keep order
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
  "tags": ["tag1","tag2","tag3"],   // 1-3 tags, short, lowercase, underscore for spaces
  "key_phrases": ["..."],          // 0-3 short phrases FROM the provided English meanings only
  "tone": "neutral"
}}

Guidelines:
- Prefer concise SGGS themes (oneness, truth, hukam, ego, naam, maya, fearlessness, compassion, humility, remembrance, detachment, service, gratitude).
- You MAY introduce new tags; keep them short and general.
- Use ONLY English meanings provided; do NOT translate Punjabi; do NOT add history/new claims.

Known tags (optional guidance): {known_tags[:50]}

Input JSON:
{json.dumps(batch_payload, ensure_ascii=False)}
""".strip()

    out = _gen_json_with_retries(client, MODEL_TAGGER, prompt, attempts=3, temperature=0.2)
    if not isinstance(out, list):
        raise ValueError(f"Expected list from tag_pass, got {type(out)}")
    return out


def write_pass(client: genai.Client, batch_payload: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    schema_desc = """
Return STRICT JSON array. Each item must be:
{
  "lesson_id": "<id>",
  "source": {"pauri_indices":[...], "ang_range":{"start":1,"end":1}},
  "tags": ["..."],
  "blocks": [
    {"type":"guided_reading","text":"..."},
    {"type":"meaning","text":"..."},
    {"type":"situation","scenario":"...","choices":[{"id":"A","text":"..."},{"id":"B","text":"..."}],"best_choice":"A","why":"..."},
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
- Output MUST be valid JSON array ONLY.

Lesson skeleton (always):
1) guided_reading (1–2 sentences)
2) meaning (2–4 sentences)
3) situation (2–3 sentences + A/B + 1 sentence why tied to tags)
4) check (one simple Q&A)
5) close (one short takeaway)

{schema_desc}

Input JSON:
{json.dumps(batch_payload, ensure_ascii=False)}
""".strip()

    out = _gen_json_with_retries(client, MODEL_WRITER, prompt, attempts=3, temperature=0.2)
    if not isinstance(out, list):
        raise ValueError(f"Expected list from write_pass, got {type(out)}")
    return out


def _split_and_write_pass(client: genai.Client, writer_in: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    If JSON parsing fails or model returns malformed JSON for a big chunk,
    split into smaller chunks until it succeeds. Never stops the whole run.
    """
    try:
        return write_pass(client, writer_in)
    except Exception as e:
        # base case: single item still failing -> skip it (log and continue)
        if len(writer_in) <= 1:
            one = writer_in[0] if writer_in else {}
            sid = one.get("id")
            src = one.get("source")
            print(f"⚠️  Skipping 1 lesson due to repeated failure. id={sid} source={src} err={e}")
            return []
        mid = len(writer_in) // 2
        left = _split_and_write_pass(client, writer_in[:mid])
        right = _split_and_write_pass(client, writer_in[mid:])
        return left + right


# -----------------------------
# Batch building
# -----------------------------
def build_batches(lesson_groups: List[List[Pauri]]) -> List[List[Dict[str, Any]]]:
    batches: List[List[Dict[str, Any]]] = []
    current: List[Dict[str, Any]] = []

    for group in lesson_groups:
        ang_start = min(p.ang_start for p in group)
        ang_end = max(p.ang_end for p in group)
        pauri_indices = [p.pauri_index for p in group]

        lesson_id = deterministic_lesson_id(ang_start, ang_end, pauri_indices)

        english_only: List[str] = []
        for p in group:
            for ln in p.lines:
                if ln.english:
                    english_only.append(ln.english)

        payload = {
            "id": lesson_id,  # deterministic
            "source": {"pauri_indices": pauri_indices, "ang_range": {"start": ang_start, "end": ang_end}},
            "english_meanings": english_only[:60],  # guardrail
            "full_text": [pauri_text_block(p) for p in group],
        }

        current.append(payload)
        if len(current) >= LESSONS_PER_CALL:
            batches.append(current)
            current = []

    if current:
        batches.append(current)

    return batches


# -----------------------------
# Main
# -----------------------------
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
        # Resume + dedupe
        all_lessons, done_ids = _load_existing_output(OUTPUT_FILE)
        lesson_map: Dict[str, Dict[str, Any]] = {}

        # load existing into map (dedupe by lesson_id)
        for it in all_lessons:
            lid = it.get("lesson_id")
            if isinstance(lid, str) and lid:
                lesson_map[lid] = it

        if lesson_map:
            print(f"↩️  Resuming: loaded {len(lesson_map)} unique lessons from {OUTPUT_FILE}")
        done_ids = set(lesson_map.keys())

        known_tags_registry: List[str] = [
            "hukam", "haumai", "naam", "maya", "seva", "sat", "sangat", "vairag",
            "kirpa", "gian", "prem", "nimrata", "oneness", "truth",
            "fearlessness", "compassion", "gratitude",
        ]

        for bi, batch in enumerate(batches, start=1):
            pending = [x for x in batch if x["id"] not in done_ids]
            if not pending:
                print(f"\nBatch {bi}/{len(batches)}: ✅ already done, skipping")
                continue

            print(f"\nBatch {bi}/{len(batches)}: {len(pending)} lessons")

            # Pass 1: tags
            try:
                tag_out_raw = tag_pass(
                    client,
                    [{"id": x["id"], "english_meanings": x["english_meanings"]} for x in pending],
                    known_tags_registry,
                )
            except Exception as e:
                # If tagger fails, we still continue by using empty tags (don't stop run)
                print(f"⚠️  Tagger failed for batch {bi}; continuing with empty tags. err={e}")
                tag_out_raw = []

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

            # Pass 2: writer input
            writer_in: List[Dict[str, Any]] = []
            for x in pending:
                t = tag_map.get(x["id"], {"tags": [], "key_phrases": [], "tone": "neutral"})
                writer_in.append({
                    "id": x["id"],
                    "source": x["source"],
                    "tags": t.get("tags", []),
                    "key_phrases": t.get("key_phrases", []),
                    "english_meanings": x["english_meanings"],
                    "full_text": x["full_text"],
                })

            # Robust: JSON-mode + retries + split if needed; never stops whole run
            lessons_out = _split_and_write_pass(client, writer_in)

            # Accept only items that have/derive a lesson_id
            added = 0
            for item in lessons_out:
                # normalize id
                if "lesson_id" not in item and "id" in item:
                    item["lesson_id"] = item.pop("id")

                lid = item.get("lesson_id")
                if not isinstance(lid, str) or not lid:
                    continue

                # enforce deterministic ids: if model returns wrong id, fix it from input source
                # (use the same deterministic id as our payload id when possible)
                # If writer returns mismatch, we prefer our deterministic id by matching source.
                src = item.get("source") or {}
                ang = src.get("ang_range") or {}
                pi = src.get("pauri_indices") or []
                try:
                    if isinstance(pi, list) and isinstance(ang.get("start"), int) and isinstance(ang.get("end"), int):
                        expected = deterministic_lesson_id(int(ang["start"]), int(ang["end"]), [int(x) for x in pi])
                        item["lesson_id"] = expected
                        lid = expected
                except Exception:
                    pass

                if lid in done_ids:
                    continue

                lesson_map[lid] = item
                done_ids.add(lid)
                added += 1

            # checkpoint after each batch
            out_list = list(lesson_map.values())
            _safe_checkpoint_write(OUTPUT_FILE, out_list)
            print(f"✅ Batch {bi} checkpointed. Added {added} new lessons. Total now: {len(out_list)}")

            time.sleep(SLEEP_BETWEEN_CALLS_SEC)

        out_list = list(lesson_map.values())
        _safe_checkpoint_write(OUTPUT_FILE, out_list)

        print(f"\n✅ Done. Total lessons: {len(out_list)}")
        print(f"✅ Output: {OUTPUT_FILE}")
        print(f"✅ Tags discovered: {len(known_tags_registry)}")
        print(f"📋 Tags sample: {', '.join(known_tags_registry[:20])}{'...' if len(known_tags_registry) > 20 else ''}")

    finally:
        if hasattr(client, "close"):
            try:
                client.close()
            except Exception:
                pass


if __name__ == "__main__":
    main()
