from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

grievance_store = [] 

SIMILARITY_THRESHOLD = 0.85

def detect_duplicate(grievance_id: str, text: str):
    new_embedding = model.encode([text])[0]

    similar = []
    for g in grievance_store:
        score = cosine_similarity([new_embedding], [g["embedding"]])[0][0]
        if score >= SIMILARITY_THRESHOLD:
            similar.append({"id": g["id"], "similarity_score": float(score)})

    grievance_store.append({
        "id": grievance_id or str(len(grievance_store)),
        "text": text,
        "embedding": new_embedding
    })

    return {
        "is_duplicate": len(similar) > 0,
        "similar_grievances": similar,
        "similarity_score": similar[0]["similarity_score"] if similar else 0.0
    }