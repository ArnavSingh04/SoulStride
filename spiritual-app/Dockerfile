# Spiritual Guide API for Cloud Run: Node server + Python (guide_vertex.py) for Vertex AI
# Build from spiritual-app/ (parent of server/)

FROM node:20-bookworm-slim

# Python for guide_vertex.py
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python deps (guide_vertex.py uses google-genai)
COPY requirements.txt guide_vertex.py ./
RUN python3 -m venv /app/venv && \
    /app/venv/bin/pip install --no-cache-dir -r requirements.txt

# Node server
COPY server/package.json server/package-lock.json server/
RUN cd server && npm ci --omit=dev

COPY server/*.js server/

# Cloud Run uses PORT 8080 by default
ENV PORT=8080

EXPOSE 8080

CMD ["node", "server/index.js"]
