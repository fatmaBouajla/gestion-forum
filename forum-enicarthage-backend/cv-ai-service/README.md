# Service d’analyse CV (Python)

## Lancer en local

```bash
cd cv-ai-service
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

Vérifier : http://127.0.0.1:8000/health

## Spring Boot

Dans `application.properties` :

```properties
app.cv-ai.enabled=true
app.cv-ai.base-url=http://127.0.0.1:8000
```

Si le service est arrêté, le backend applique un **score de secours** (hash + message d’indisponibilité).

## Endpoint

- `POST /analyze` — `multipart/form-data` : `file` (PDF), `poste_vise`, `contexte` (texte libre, ex. dossier candidat).

Réponse JSON : `score`, `justification`, `competences` (liste).
