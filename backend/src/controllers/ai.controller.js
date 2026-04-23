import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { AIProcessingLog } from "../models/aiProcessingLog.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const AI_SERVICE = process.env.PYTHON_AI_SERVICE_URL || "http://localhost:8001";


export const runTranslate = async (text, targetLanguage = "en") => {
  try {
    const { data } = await axios.post(`${AI_SERVICE}/translate`, {
      text,
      target_language: targetLanguage,
    });

    const translated = data.translated_text || text;
    const detected = data.detected_language || "en";


    return {
      translatedText: translated,
      detectedLanguage: detected,
    };
  } catch (err) {
    console.error("[AI] translate failed:", err.message);
    return { translatedText: text, detectedLanguage: "en" };
  }
};


export const runClassify = async (text) => {
  try {
    const { data } = await axios.post(`${AI_SERVICE}/classify`, { text });
    return {
      category: data.category || "General",
      subCategory: data.subcategory || "Other",
      keywords: data.keywords || [],
      priorityScore: data.priority_score || 25,
      summaryText: data.summary || text.slice(0, 200),
      confidence: data.confidence || 0,
    };
  } catch (err) {
    console.error("[AI] classify failed:", err.message);
    return {
      category: "General",
      subCategory: "Other",
      keywords: [],
      priorityScore: 25,
      summaryText: text.slice(0, 200),
      confidence: 0,
    };
  }
};


export const runDuplicateCheck = async (grievanceId, text) => {
  try {
    const { data } = await axios.post(`${AI_SERVICE}/detect-duplicate`, {
      grievance_id: grievanceId,
      text,
    });
    return {
      isDuplicate: data.is_duplicate || false,
      similarGrievances: data.similar_grievances || [],
      similarityScore: data.similarity_score || 0,
    };
  } catch (err) {
    console.error("[AI] duplicate check failed:", err.message);
    return { isDuplicate: false, similarGrievances: [], similarityScore: 0 };
  }
};

export const runExplain = async (text, language = "en") => {
  try {
    const { data } = await axios.post(`${AI_SERVICE}/explain`, {
      text,
      target_language: language,
    });
    return data.explanation || text;
  } catch (err) {
    console.error("[AI] explain failed:", err.message);
    return text;
  }
};



export const runOCR = async (localPath, originalname, mimetype) => {
  console.log("runninggggggggggggggg")
  try {
    if (!fs.existsSync(localPath)) {
      console.error("[OCR] File not found:", localPath);
      return "";
    }

    const form = new FormData();

    form.append("file", fs.createReadStream(localPath), {
      filename: originalname,
      contentType: mimetype,
    });

    const { data } = await axios.post(`${AI_SERVICE}/ocr`, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 30000,
    });
    console.log("dataaaa",data)
    return data.extracted_text || "";  
  } catch (err) {
    console.error("[AI] OCR failed:", err.message);
    return "";
  }
};

export const saveAILog = async ({
  grievanceId,
  detectedLanguage,
  translatedText,
  classificationResult,
  priorityScore,
  processingTimeMs,
  status = "Success",
}) => {
  try {
    await AIProcessingLog.create({
      grievanceId,
      detectedLanguage,
      translatedText,
      classificationResult: JSON.stringify(classificationResult),
      priorityScore,
      processingTimeMs,
      status,
    });
  } catch (err) {
    console.error("[AI] saveAILog failed:", err.message);
  }
};



// POST /api/ai/translate
export const translate = asyncHandler(async (req, res) => {
  const { text, targetLanguage = "en" } = req.body;
  if (!text) throw new ApiError(400, "text is required");

  const result = await runTranslate(text, targetLanguage);

  return res.status(200).json(new ApiResponse(200, {
    originalText: text,
    translatedText: result.translatedText,
    detectedLanguage: result.detectedLanguage,
  }));
});


// POST /api/ai/classify
export const classify = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) throw new ApiError(400, "text is required");

  const result = await runClassify(text);
  return res.status(200).json(new ApiResponse(200, result, "Classification done"));
});


// POST /api/ai/summarize
export const summarize = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) throw new ApiError(400, "text is required");

  const { data } = await axios.post(`${AI_SERVICE}/summarize`, { text });
  return res.status(200).json(new ApiResponse(200, { summary: data.summary }));
});


// POST /api/ai/detect-duplicate
export const detectDuplicate = asyncHandler(async (req, res) => {
  const { grievanceId, text } = req.body;
  if (!text) throw new ApiError(400, "text is required");

  const result = await runDuplicateCheck(grievanceId, text);
  return res.status(200).json(new ApiResponse(200, result));
});


// POST /api/ai/explain
export const explain = asyncHandler(async (req, res) => {
  const { text, language = "en" } = req.body;
  if (!text) throw new ApiError(400, "text is required");

  const explanation = await runExplain(text, language);
  return res.status(200).json(new ApiResponse(200, { explanation }));
});


// POST /api/ai/ocr 
export const ocr = asyncHandler(async (req, res) => {
  const localPath = req.file?.path;
  if (!localPath) throw new ApiError(400, "No file provided");

  try {
    const extracted = await runOCR(localPath, req.file.originalname, req.file.mimetype);
    return res.status(200).json(new ApiResponse(200, { extracted_text: extracted }));
  } finally {
    try { if (fs.existsSync(localPath)) fs.unlinkSync(localPath); } catch (_) {}
  }
});