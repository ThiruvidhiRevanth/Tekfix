from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class IngredientInput(BaseModel):
    ingredients: str

@app.post("/generate-recipes")
def generate_recipes(data: IngredientInput):
    try:
        prompt = (
            f"I have {data.ingredients}. Suggest 5 recipes I can make. "
            "For each recipe, return in this format:\n\n"
            "**Title:** Recipe Name\n"
            "**Ingredients:**\n- item 1\n- item 2\n...\n"
            "**Preparation:**\nStep-by-step instructions\n\n"
            "Separate each recipe using '---'."
        )
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return {"recipes": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
