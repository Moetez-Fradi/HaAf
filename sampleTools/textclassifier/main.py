import requests
import json
from dotenv import load_dotenv
import os
import fastapi
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

CATEGORIES_ENV = os.getenv("CATEGORIES")
if not CATEGORIES_ENV:
    raise RuntimeError("CATEGORIES environment variable is not set")
CATEGORIES = [c.strip() for c in CATEGORIES_ENV.split(",") if c.strip()]

class ClassificationRequest(BaseModel):
    text: str

@app.post("/run")
async def classify(req: ClassificationRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    prompt = (
        f"Classify the following text into ONE of these categories: {', '.join(CATEGORIES)}.\n"
        f"Text: {req.text}\n"
        "Answer with only the closest category."
    )

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            data=json.dumps({
                "model": "meta-llama/llama-3.3-8b-instruct:free",
                "messages": [
                {
                    "role": "user",
                    "content": f"{prompt}"
                }
                ],
            })
        )
        response.raise_for_status()

        category = response.json()["choices"][0]["message"]["content"].strip()

        if category not in CATEGORIES:
            for c in CATEGORIES:
                if c.lower() in category.lower():
                    category = c
                    break

        return {"closest_category": category}

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))