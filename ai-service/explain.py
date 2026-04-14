import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "ta": "Tamil",
    "mr": "Marathi",
    "bn": "Bengali",
    "te": "Telugu",
    "gu": "Gujarati",
    "kn": "Kannada",
    "ml": "Malayalam",
    "pa": "Punjabi",
}


def explain_grievance(text: str, target_language: str = "en") -> dict:
    # Rewrites the captured grievance back to the user in simple language so they know it was understood correctly
    lang_name = LANGUAGE_NAMES.get(target_language, "English")

    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a government assistant explaining grievance submissions to citizens. "
                        "Use simple language. Be empathetic. Do not promise solutions or timelines. "
                        "Do not add information not present in the original complaint."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Explain this grievance back to the citizen in simple {lang_name} in 2-3 sentences. "
                        f"Confirm what was understood from their complaint.\n\nGrievance:\n{text}"
                    ),
                },
            ],
            temperature=0.3,
        )
        return {"explanation": response.choices[0].message.content.strip()}
    except Exception as e:
        print(f"Explain error: {e}")
        return {"explanation": text}