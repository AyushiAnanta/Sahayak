from langdetect import detect, DetectorFactory
from deep_translator import GoogleTranslator

DetectorFactory.seed = 0

LANGUAGE_NAMES = {
    "en": "english",
    "hi": "hindi",
    "ta": "tamil",
    "mr": "marathi",
    "bn": "bengali",
    "te": "telugu",
    "gu": "gujarati",
    "kn": "kannada",
    "ml": "malayalam",
    "pa": "punjabi",
}


def detect_and_translate(text: str, target_language: str = "en") -> dict:
    try:
        detected = detect(text)
    except Exception:
        detected = "en"

    is_likely_non_english = not all(ord(c) < 128 for c in text.replace(" ", ""))
    
    if detected == target_language and not is_likely_non_english:
        return {"translated_text": text, "detected_language": detected}

    target_name = LANGUAGE_NAMES.get(target_language, "english")

    try:
        translated = GoogleTranslator(source="auto", target=target_name).translate(text)
        # If translation returned same text, detected was wrong
        if translated.strip() == text.strip():
            detected = target_language
    except Exception as e:
        print(f"Translation error: {e}")
        translated = text

    return {"translated_text": translated, "detected_language": detected}