from langdetect import detect, DetectorFactory
from deep_translator import GoogleTranslator

DetectorFactory.seed = 0

# deep-translator needs full language names not codes
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
    # Detects source language — if already target language, skip translation entirely
    try:
        detected = detect(text)
    except Exception:
        detected = "en"

    if detected == target_language:
        return {
            "translated_text": text,
            "detected_language": detected,
        }

    target_name = LANGUAGE_NAMES.get(target_language, "english")

    try:
        # GoogleTranslator is free — uses Google Translate, no API key needed
        translated = GoogleTranslator(source="auto", target=target_name).translate(text)
    except Exception as e:
        print(f"Translation error: {e}")
        translated = text  # return original if translation fails

    return {
        "translated_text": translated,
        "detected_language": detected,
    }