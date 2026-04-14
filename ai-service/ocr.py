import pytesseract
from PIL import Image
import pdfplumber

def extract_text(file_path: str, file_type: str) -> str:
    if file_type in ["jpg", "jpeg", "png"]:
        image = Image.open(file_path).convert("L")
        return pytesseract.image_to_string(image, lang="eng+hin")

    elif file_type == "pdf":
        text = ""

        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()

                if page_text:
                    text += page_text
                else:
                    image = page.to_image().original.convert("L")
                    text += pytesseract.image_to_string(image, lang="eng+hin")

        return text.strip()

    return ""