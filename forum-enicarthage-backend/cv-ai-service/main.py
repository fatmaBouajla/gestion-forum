"""
Microservice d'analyse de CV pour le Forum ENICarthage.
Extraction texte PDF + score de similarité avec le poste visé + justification.
"""
import re
from typing import List

from fastapi import FastAPI, File, Form, UploadFile
from pydantic import BaseModel
from pypdf import PdfReader
import io

app = FastAPI(title="CV Analysis Service", version="1.0.0")

# Lexique de compétences / mots-clés (forum entreprise, ingénierie, orga)
SKILL_KEYWORDS = [
    "java", "spring", "angular", "typescript", "javascript", "python", "sql", "mysql",
    "docker", "git", "agile", "scrum", "gestion de projet", "leadership", "communication",
    "marketing", "sponsoring", "négociation", "logistique", "événementiel", "design",
    "figma", "photoshop", "excel", "powerpoint", "recherche", "analyse", "teamwork",
    "travail d'équipe", "organisation", "planification", "budget", "partenariat",
    "réseaux sociaux", "rédaction", "présentation", "c++", "c#", "linux", "aws",
    "machine learning", "ia", "data", "mongodb", "react", "node", "html", "css",
    "ingenieur", "ingénieur", "stage", "projet", "association", "bénévolat",
]

STOPWORDS = {
    "le", "la", "les", "un", "une", "des", "de", "du", "et", "ou", "en", "au", "aux",
    "à", "pour", "dans", "sur", "par", "ce", "cette", "ces", "son", "sa", "ses", "il",
    "elle", "nous", "vous", "ils", "est", "sont", "être", "avoir", "fait", "the", "a",
    "an", "of", "and", "or", "to", "in", "for", "with", "on", "at", "by", "from",
}


class AnalyzeResponse(BaseModel):
    score: float
    justification: str
    competences: List[str]


def extract_pdf_text(data: bytes) -> str:
    reader = PdfReader(io.BytesIO(data))
    parts: List[str] = []
    for page in reader.pages:
        t = page.extract_text()
        if t:
            parts.append(t)
    return "\n".join(parts)


def tokenize(text: str) -> set:
    text = text.lower()
    text = re.sub(r"[^\w\sàâäéèêëïîôùûüçœæ-]", " ", text, flags=re.IGNORECASE)
    words = text.split()
    return {w for w in words if len(w) > 2 and w not in STOPWORDS}


def jaccard(a: set, b: set) -> float:
    if not a or not b:
        return 0.0
    inter = len(a & b)
    union = len(a | b)
    return inter / union if union else 0.0


def find_competences(text: str) -> List[str]:
    low = text.lower()
    found = []
    for kw in SKILL_KEYWORDS:
        if kw.lower() in low:
            found.append(kw)
    return sorted(set(found), key=lambda x: x.lower())


def build_justification(score: float, competences: List[str], poste: str) -> str:
    comp_str = ", ".join(competences[:8]) if competences else "peu de mots-clés métiers détectés"
    if score >= 75:
        return (
            f"Forte adéquation avec le poste « {poste} ». "
            f"Compétences / thèmes repérés : {comp_str}. Profil à prioriser pour entretien."
        )
    if score >= 55:
        return (
            f"Adéquation correcte avec « {poste} ». "
            f"Éléments pertinents : {comp_str}. À creuser en entretien."
        )
    return (
        f"Pertinence limitée pour « {poste} ». "
        f"Thèmes détectés : {comp_str}. Profil à confirmer ou à écarter selon vos critères."
    )


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    file: UploadFile = File(...),
    poste_vise: str = Form(""),
    contexte: str = Form(""),
):
    raw = await file.read()
    text = extract_pdf_text(raw)
    if not text.strip():
        return AnalyzeResponse(
            score=25.0,
            justification="Impossible d'extraire le texte du PDF (fichier vide, scanné sans OCR, ou protégé).",
            competences=[],
        )

    poste = (poste_vise or "").strip() or "poste non précisé"
    ctx = (contexte or "").strip()[:8000]
    job_blob = f"{poste} {ctx}"
    cv_tokens = tokenize(text)
    job_tokens = tokenize(job_blob)
    jac = jaccard(cv_tokens, job_tokens)

    competences = find_competences(text)
    bonus = min(15, len(competences) * 2)
    score = 30 + jac * 55 + bonus
    score = max(0, min(100, round(score, 2)))

    justification = build_justification(score, competences, poste)
    return AnalyzeResponse(score=score, justification=justification, competences=competences)
