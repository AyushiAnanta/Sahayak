import sys
import os
sys.path.append(os.path.dirname(__file__))

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from translate import detect_and_translate
from classify import classify_grievance, summarize_text
from duplicate import detect_duplicate
from explain import explain_grievance
from ocr import extract_text

app = FastAPI(title="Grievance AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://backend:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request models ─────────────────────────────────────────────────────────────

class TranslateInput(BaseModel):
    text: str
    target_language: str = "en"

class ClassifyInput(BaseModel):
    text: str

class SummarizeInput(BaseModel):
    text: str

class DuplicateInput(BaseModel):
    grievance_id: Optional[str] = None
    text: str

class ExplainInput(BaseModel):
    text: str
    target_language: str = "en"


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    # Returns ok — used by Node.js and Docker health checks to verify service is alive
    return {"status": "ok", "service": "grievance-ai", "port": 8001}


@app.post("/translate")
def translate(body: TranslateInput):
    # Detects language and translates to English using Google Translate (free, no key)
    return detect_and_translate(body.text, body.target_language)


@app.post("/classify")
def classify(body: ClassifyInput):
    # Classifies grievance into category/subcategory/keywords/priority using Groq LLaMA3 (free)
    return classify_grievance(body.text)


@app.post("/summarize")
def summarize(body: SummarizeInput):
    # Summarizes grievance text into 2-3 sentences using Groq LLaMA3 (free)
    return {"summary": summarize_text(body.text)}


@app.post("/detect-duplicate")
def duplicate(body: DuplicateInput):
    # Compares grievance against stored embeddings using MiniLM (runs locally, fully free)
    return detect_duplicate(body.grievance_id, body.text)


@app.post("/explain")
def explain(body: ExplainInput):
    # Generates simplified explanation in user's preferred language using Groq LLaMA3 (free)
    return explain_grievance(body.text, body.target_language)


@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    # Extracts text from uploaded image or PDF using Tesseract (runs locally, fully free)
    contents = await file.read()
    extension = file.filename.split(".")[-1].lower()
    text = extract_text(contents, extension)
    return {"extracted_text": text, "file_type": extension}