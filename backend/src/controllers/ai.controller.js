import axios from "axios";
import { Grievance } from "../models/grievance.model.js";
import { AIProcessingLog } from "../models/aiProcessingLog.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Base URL of your Python FastAPI/Flask AI service
const AI_SERVICE = process.env.PYTHON_AI_SERVICE_URL || "http://localhost:8000";


// POST /api/ai/translate — sends text to Python service and returns translated text + detected language
export const translate = asyncHandler(async (req, res) => {
  const { text, targetLanguage = "en" } = req.body;
  if (!text) throw new ApiError(400, "text is required");

  const { data } = await axios.post(`${AI_SERVICE}/translate`, { text, target_language: targetLanguage });

  return res.status(200).json(new ApiResponse(200, {
    originalText: text,
    translatedText: data.translated_text,
    detectedLanguage: data.detected_language,
  }));
});


// POST /api/ai/classify — classifies grievance text and saves category/keywords/priority to DB if grievanceId given
export const classify = asyncHandler(async (req, res) => {
  const { grievanceId, text } = req.body;
  if (!text) throw new ApiError(400, "text is required");

  const { data } = await axios.post(`${AI_SERVICE}/classify`, { text });

  // If a grievanceId is provided, persist AI results into the Grievance document
  if (grievanceId) {
    await Grievance.findByIdAndUpdate(grievanceId, {
      category: data.category,
      subCategory: data.subcategory,
      keywords: data.keywords,
      priorityScore: data.priority_score,
      summaryText: data.summary,
    });

    // Save the AI processing log for audit/explainability
    await AIProcessingLog.create({
      grievanceId,
      detectedLanguage: data.detected_language || "en",
      translatedText: text,
      classificationResult: JSON.stringify({ category: data.category, subcategory: data.subcategory, confidence: data.confidence }),
      priorityScore: data.priority_score,
      status: "Success",
    });
  }

  return res.status(200).json(new ApiResponse(200, data, "Classification done"));
});


// POST /api/ai/summarize — sends grievance text to Python service and returns a short summary
export const summarize = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) throw new ApiError(400, "text is required");

  const { data } = await axios.post(`${AI_SERVICE}/summarize`, { text });

  return res.status(200).json(new ApiResponse(200, { summary: data.summary }));
});


// POST /api/ai/detect-duplicate — checks if a similar grievance already exists using embeddings
export const detectDuplicate = asyncHandler(async (req, res) => {
  const { grievanceId, text } = req.body;
  if (!text) throw new ApiError(400, "text is required");

  const { data } = await axios.post(`${AI_SERVICE}/detect-duplicate`, {
    grievance_id: grievanceId,
    text,
  });

  return res.status(200).json(new ApiResponse(200, {
    is_duplicate: data.is_duplicate,
    similar_grievances: data.similar_grievances,
    similarity_score: data.similarity_score,
  }));
});


// POST /api/ai/explain — generates a simple explanation of the grievance in the user's preferred language
export const explain = asyncHandler(async (req, res) => {
  const { grievanceId, text, language = "en" } = req.body;
  if (!text) throw new ApiError(400, "text is required");

  const { data } = await axios.post(`${AI_SERVICE}/explain`, { text, target_language: language });

  // Optionally store the user-language summary back in the grievance
  if (grievanceId) {
    await Grievance.findByIdAndUpdate(grievanceId, { summaryUserLang: data.explanation });
  }

  return res.status(200).json(new ApiResponse(200, { explanation: data.explanation }));
});