import json
import os
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

CATEGORIES = [
    "General", "Electricity", "Water", "Road", "Healthcare",
    "Food", "Labour", "Agriculture", "Education", "ConsumerAffairs"
]

CATEGORY_EXAMPLES = """
- Water: water supply shortage, pipe leakage, contamination, low pressure, no water for days
- Electricity: power cut, no electricity, voltage fluctuation, transformer broken, street light not working
- Road: pothole, broken road, road flooding, no street light, encroachment on road
- Healthcare: hospital not working, doctor absent, medicine shortage, ambulance not coming
- Food: ration not given, PDS shop closed, food adulteration, ration card issue
- Labour: wages not paid, workplace accident, child labour, MGNREGA work not given
- Agriculture: crop damaged, irrigation problem, fertilizer not available, farm loan issue
- Education: school building broken, teacher absent, scholarship not received, mid-day meal issue
- ConsumerAffairs: shopkeeper overcharging, fake product, fraud, wrong weights
- General: anything that does not fit the above
"""

PRIORITY_GUIDE = """
Priority score 1-100:
- 1 to 25: Low — minor inconvenience, affects 1 person
- 26 to 50: Medium — affects daily routine, needs attention within a week
- 51 to 75: High — health or safety risk, multiple families affected
- 76 to 100: Critical — immediate danger, large community, same-day action needed
"""


def classify_grievance(text: str) -> dict:
    # Sends grievance to Groq LLaMA3 with detailed prompt and parses structured JSON response
    prompt = f"""You are an expert government grievance officer in India. Read this citizen complaint and classify it.

CATEGORIES:
{CATEGORY_EXAMPLES}

{PRIORITY_GUIDE}

Citizen complaint: "{text}"

Respond with ONLY a raw JSON object. No explanation. No markdown. No code blocks. Just the JSON.

{{
  "category": "<most relevant category>",
  "subcategory": "<specific issue, e.g. Water Supply Shortage>",
  "confidence": <float 0.0 to 1.0>,
  "keywords": ["<3-5 key words from complaint>"],
  "priority_score": <integer 1-100>,
  "summary": "<MAXIMUM 2 sentences, under 50 words, official tone, no repetition of full complaint>"
}}"""

    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {
                    "role": "system",
                    "content": "You are a grievance classification officer. Always respond with valid raw JSON only. Never add explanation, never use markdown or code blocks."
                },
                {
                    "role": "user",
                    "content": prompt
                },
            ],
            temperature=0.0,
            max_tokens=500,
        )

        raw = response.choices[0].message.content.strip()
        print(f"[classify] LLM raw response: {raw}")

        # Strip markdown fences if model adds them anyway
        raw = re.sub(r"```json|```", "", raw).strip()

        # Extract just the JSON object in case model adds surrounding text
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start == -1 or end == 0:
            raise ValueError(f"No JSON found in: {raw}")
        raw = raw[start:end]

        result = json.loads(raw)

        # Validate and clamp all fields
        if result.get("category") not in CATEGORIES:
            print(f"[classify] Bad category: {result.get('category')}")
            result["category"] = "General"

        result["priority_score"] = max(1, min(100, int(result.get("priority_score", 25))))
        result["confidence"] = round(max(0.0, min(1.0, float(result.get("confidence", 0.5)))), 2)

        if not isinstance(result.get("keywords"), list):
            result["keywords"] = []
        if not result.get("summary"):
            result["summary"] = text[:200]
        if not result.get("subcategory"):
            result["subcategory"] = "Other"

        print(f"[classify] Final result: {result}")
        return result

    except json.JSONDecodeError as e:
        print(f"[classify] JSON parse failed: {e} | raw: {raw}")
        return _rule_based_fallback(text)
    except Exception as e:
        print(f"[classify] Error: {e}")
        return _rule_based_fallback(text)


def summarize_text(text: str) -> str:
    # Generates a short factual official summary of the grievance
    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {
                    "role": "system",
                    "content": "Summarize in exactly 1 sentence under 30 words. Be concise. Output only the summary."
                },
                {
                    "role": "user",
                    "content": f"Summarize:\n\n{text}"
                },
            ],
            temperature=0.0,
            max_tokens=150,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"[summarize] Error: {e}")
        return text[:200]


def _rule_based_fallback(text: str) -> dict:
    # Last resort when LLM fails — uses keyword matching to at least get the category right
    text_lower = text.lower()
    keywords = list(set([w for w in text_lower.split() if len(w) > 4]))[:5]

    category = "General"
    subcategory = "Other"
    priority = 25

    if any(w in text_lower for w in ["water", "pipe", "supply", "leakage", "tap", "drainage"]):
        category, subcategory, priority = "Water", "Water Supply Issue", 45
    elif any(w in text_lower for w in ["electricity", "power", "light", "electric", "voltage", "transformer"]):
        category, subcategory, priority = "Electricity", "Power Supply Issue", 40
    elif any(w in text_lower for w in ["road", "pothole", "street", "path", "footpath"]):
        category, subcategory, priority = "Road", "Road Damage", 35
    elif any(w in text_lower for w in ["hospital", "doctor", "medicine", "health", "ambulance"]):
        category, subcategory, priority = "Healthcare", "Medical Services", 60
    elif any(w in text_lower for w in ["food", "ration", "pds", "hunger", "starv"]):
        category, subcategory, priority = "Food", "Ration Issue", 55
    elif any(w in text_lower for w in ["school", "teacher", "education", "student", "scholarship"]):
        category, subcategory, priority = "Education", "Education Issue", 40
    elif any(w in text_lower for w in ["salary", "wage", "work", "labour", "job", "mgnrega"]):
        category, subcategory, priority = "Labour", "Wage Issue", 50
    elif any(w in text_lower for w in ["farm", "crop", "irrigation", "fertilizer", "agriculture"]):
        category, subcategory, priority = "Agriculture", "Crop Issue", 45

    return {
        "category": category,
        "subcategory": subcategory,
        "confidence": 0.4,
        "keywords": keywords,
        "priority_score": priority,
        "summary": text[:200],
    }