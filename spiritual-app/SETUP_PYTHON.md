# Python Setup Guide for lessonCreation.py

## Issue
The script requires `google-genai` package, which depends on `cryptography`. On MSYS2/Git Bash Python, `cryptography` needs to be built from source, which requires Rust.

## Solutions

### Option 1: Use Windows Python (Recommended)
1. Download Python from [python.org](https://www.python.org/downloads/)
2. Install Python (check "Add Python to PATH" during installation)
3. Open a **new** PowerShell or Command Prompt (not Git Bash)
4. Navigate to the project:
   ```powershell
   cd c:\Users\arnav\OneDrive\Desktop\SoulStride\spiritual-app
   ```
5. Create and activate virtual environment:
   ```powershell
   python -m venv venv
   ```
   Then activate (use the path that exists on your system):
   - **Windows Python** (venv has `Scripts` folder):
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **MSYS2/Git Bash Python** (venv has `bin` folder):
     ```powershell
     .\venv\bin\Activate.ps1
     ```
6. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

### Option 2: Install Rust (for MSYS2 Python)
1. Install Rust from [rustup.rs](https://rustup.rs/)
2. Restart your terminal
3. Try installing again:
   ```bash
   cd c:\Users\arnav\OneDrive\Desktop\SoulStride\spiritual-app
   source venv/bin/activate
   pip install -r requirements.txt
   ```

### Option 3: Use Pre-built Cryptography (if available)
Try installing a specific version that might have wheels:
```bash
pip install cryptography==41.0.7
pip install -r requirements.txt
```

## Running the Script

After installation, activate the virtual environment and run:

**Windows PowerShell:**
```powershell
.\venv\Scripts\Activate.ps1
python lessonCreation.py
```

**Git Bash/MSYS2:**
```bash
source venv/bin/activate
python lessonCreation.py
```

## Authentication Setup

Before running, ensure you have:
1. Google Cloud Project with Vertex AI API enabled
2. Authenticated with Application Default Credentials:
   ```bash
   gcloud auth application-default login
   ```
3. Set environment variables (optional):
   ```bash
   export GOOGLE_CLOUD_PROJECT="your-project-id"
   export GOOGLE_CLOUD_LOCATION="us-central1"
   export SGGS_INPUT="sggs.json"
   export LESSONS_OUTPUT="lessons.json"
   ```
