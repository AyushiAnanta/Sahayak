import io
import base64
import os
import pdfplumber
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def image_to_base64(image_bytes: bytes) -> str:
    return base64.b64encode(image_bytes).decode("utf-8")

def extract_text_from_bytes(file_bytes: bytes) -> str:
    b64 = image_to_base64(file_bytes)
    
    response = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct", 
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{b64}"
                        }
                    },
                    {
                        "type": "text",
                        "text": "Extract all text from this image exactly as written. Preserve the original language (Hindi, English, or mixed). Output only the extracted text, nothing else."
                    }
                ]
            }
        ],
        max_tokens=1024,
    )
    
    return response.choices[0].message.content.strip()


def extract_text(file_bytes: bytes, file_type: str) -> str:
    if file_type in ["jpg", "jpeg", "png", "webp"]:
        return extract_text_from_bytes(file_bytes)

    elif file_type == "pdf":
        text = ""
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                # Try native text first (free, instant)
                page_text = page.extract_text()
                if page_text and page_text.strip():
                    text += page_text
                else:
                    buf = io.BytesIO()
                    page.to_image(resolution=200).original.save(buf, format="PNG")
                    text += extract_text_from_bytes(buf.getvalue())
        return text.strip()

    return ""