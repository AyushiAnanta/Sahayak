import fs from "fs";
import { Grievance } from "../models/grievance.model.js";
import { Notification } from "../models/notification.model.js";
import { StatusLog } from "../models/statusLog.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Import AI helpers — these call Python internally, no HTTP needed from frontend
import {
  runTranslate,
  runClassify,
  runDuplicateCheck,
  runExplain,
  runOCR,
  saveAILog,
} from "./ai.controller.js";


// ─────────────────────────────────────────────────────────────────────────────
// POST /api/grievance/upload
// Uploads file → OCR → translate → returns pre-filled data to frontend
// Frontend uses this to pre-fill the grievance form before user submits
// ─────────────────────────────────────────────────────────────────────────────
export const uploadGrievanceFile = asyncHandler(async (req, res) => {
  const localPath = req.file?.path;
  if (!localPath) throw new ApiError(400, "No file provided");

  const extension = req.file.originalname.split(".").pop().toLowerCase();
  const inputType = extension === "pdf" ? "pdf" : "image";

  // ✅ Step 1 — Run OCR FIRST
  const extractedText = await runOCR(localPath, req.file.originalname, req.file.mimetype);
  console.log(`[upload] OCR extracted ${extractedText.length} chars`);

  // ✅ Step 2 — Upload to Cloudinary
  const uploaded = await uploadOnCloudinary(localPath);
  if (!uploaded) throw new ApiError(500, "Cloudinary upload failed");

  // Step 3 — Translate
  let translatedText = extractedText;
  let detectedLanguage = "en";

  if (extractedText.length > 10) {
    const translated = await runTranslate(extractedText, "en");
    translatedText = translated.translatedText;
    detectedLanguage = translated.detectedLanguage;
  }

  // Cleanup
  try { if (fs.existsSync(localPath)) fs.unlinkSync(localPath); } catch (_) {}

  return res.status(200).json(new ApiResponse(200, {
    url: uploaded.url,
    inputType,
    extractedText,
    translatedText,
    detectedLanguage,
  }, "File uploaded and processed"));
});


// ─────────────────────────────────────────────────────────────────────────────
// POST /api/grievance/create
// Creates grievance → auto-runs full AI pipeline → saves everything to DB
// ─────────────────────────────────────────────────────────────────────────────
export const createGrievance = asyncHandler(async (req, res) => {
  const {
    inputType,
    originalText,
    originalLanguage,
    translatedText,   // if coming from upload flow, frontend passes this directly
    district,
    pincode,
    input_url,        // cloudinary URL from upload step (optional)
    preferredLanguage, // user's language for the explanation e.g. "hi"
  } = req.body;

  if (!inputType || !originalText || !district || !pincode) {
    throw new ApiError(400, "inputType, originalText, district and pincode are required");
  }

  const startTime = Date.now();

  // ── Step 1: Translate if not already done (text submissions) ────────────────
  let finalTranslatedText = translatedText;
  let finalOriginalLanguage = originalLanguage;

  if (!finalTranslatedText) {
    const translated = await runTranslate(originalText, "en");
    finalTranslatedText = translated.translatedText;
    finalOriginalLanguage = translated.detectedLanguage;
  }

  // ── Step 2: Classify the translated text ────────────────────────────────────
  const classification = await runClassify(finalTranslatedText);
  console.log(`[create] Classified as: ${classification.category} (${classification.subCategory})`);

  // ── Step 3: Generate user-language explanation ───────────────────────────────
  const userLang = preferredLanguage || finalOriginalLanguage || "en";
  const summaryUserLang = await runExplain(finalTranslatedText, userLang);

  // ── Step 4: Save grievance to DB with all AI fields populated ───────────────
  const grievance = await Grievance.create({
    userId: req.user._id,
    inputType,
    originalText,
    originalLanguage: finalOriginalLanguage || "en",
    translatedText: finalTranslatedText,
    input_url: input_url || "",
    district,
    pincode,
    status: "pending",
    is_deleted: false,
    // AI fields — all populated automatically
    category: classification.category,
    subCategory: classification.subCategory,
    keywords: classification.keywords,
    priorityScore: classification.priorityScore,
    summaryText: classification.summaryText,
    summaryUserLang,
  });

  // ── Step 5: Duplicate check — done after saving so we have the grievanceId ──
  const duplicateResult = await runDuplicateCheck(grievance._id.toString(), finalTranslatedText);
  if (duplicateResult.isDuplicate) {
    console.log(`[create] Duplicate detected — similar to: ${duplicateResult.similarGrievances.map(g => g.id).join(", ")}`);
    // We still save it — admin can review and merge
  }

  // ── Step 6: Save AI processing log for explainability ───────────────────────
  const processingTimeMs = Date.now() - startTime;
  await saveAILog({
    grievanceId: grievance._id,
    detectedLanguage: finalOriginalLanguage || "en",
    translatedText: finalTranslatedText,
    classificationResult: {
      category: classification.category,
      subCategory: classification.subCategory,
      confidence: classification.confidence,
      isDuplicate: duplicateResult.isDuplicate,
      similarCount: duplicateResult.similarGrievances.length,
    },
    priorityScore: classification.priorityScore,
    processingTimeMs,
    status: "Success",
  });

  // ── Step 7: Notify user ──────────────────────────────────────────────────────
  await Notification.create({
    userId: req.user._id,
    grievanceId: grievance._id,
    message: `Your grievance has been submitted and classified under ${classification.category}. ID: ${grievance._id}`,
    notification_type: "Initiated",
    status: "unread",
  });

  return res.status(201).json(new ApiResponse(201, {
    grievance,
    aiSummary: {
      category: classification.category,
      subCategory: classification.subCategory,
      priorityScore: classification.priorityScore,
      isDuplicate: duplicateResult.isDuplicate,
      similarGrievances: duplicateResult.similarGrievances,
      processingTimeMs,
    },
  }, "Grievance created and processed successfully"));
});


// ─────────────────────────────────────────────────────────────────────────────
// GET /api/grievance/all
// ─────────────────────────────────────────────────────────────────────────────
export const getUserGrievances = asyncHandler(async (req, res) => {
  // Fetches all non-deleted grievances for the logged-in user with pagination
  const { status, page = 1, limit = 10 } = req.query;

  const filter = { userId: req.user._id, is_deleted: false };
  if (status) filter.status = status;

  const grievances = await Grievance.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("departmentId", "name email")
    .populate("assignedOfficerId", "name username");

  const total = await Grievance.countDocuments(filter);

  return res.status(200).json(new ApiResponse(200, { grievances, total, page: Number(page) }));
});


// ─────────────────────────────────────────────────────────────────────────────
// GET /api/grievance/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getGrievanceById = asyncHandler(async (req, res) => {
  // Fetches a single grievance by id — must belong to the logged-in user
  const grievance = await Grievance.findOne({
    _id: req.params.id,
    userId: req.user._id,
    is_deleted: false,
  })
    .populate("departmentId", "name email phone deptHead")
    .populate("assignedOfficerId", "name username email");

  if (!grievance) throw new ApiError(404, "Grievance not found");

  return res.status(200).json(new ApiResponse(200, grievance));
});


// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/grievance/:id/edit
// ─────────────────────────────────────────────────────────────────────────────
export const editGrievance = asyncHandler(async (req, res) => {
  // Allows editing only while status is still pending — re-runs AI pipeline on edit
  const grievance = await Grievance.findOne({
    _id: req.params.id,
    userId: req.user._id,
    is_deleted: false,
  });

  if (!grievance) throw new ApiError(404, "Grievance not found");
  if (grievance.status !== "pending") {
    throw new ApiError(400, "Only pending grievances can be edited");
  }

  const { originalText, district, pincode } = req.body;

  if (originalText) {
    grievance.originalText = originalText;

    // Re-run AI pipeline since text changed
    const { translatedText, detectedLanguage } = await runTranslate(originalText, "en");
    grievance.translatedText = translatedText;
    grievance.originalLanguage = detectedLanguage;

    const classification = await runClassify(translatedText);
    grievance.category = classification.category;
    grievance.subCategory = classification.subCategory;
    grievance.keywords = classification.keywords;
    grievance.priorityScore = classification.priorityScore;
    grievance.summaryText = classification.summaryText;
  }

  if (district) grievance.district = district;
  if (pincode) grievance.pincode = pincode;

  await grievance.save();

  return res.status(200).json(new ApiResponse(200, grievance, "Grievance updated and re-processed"));
});


// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/grievance/:id
// ─────────────────────────────────────────────────────────────────────────────
export const deleteGrievance = asyncHandler(async (req, res) => {
  // Soft deletes a grievance by setting is_deleted = true
  const grievance = await Grievance.findOne({
    _id: req.params.id,
    userId: req.user._id,
    is_deleted: false,
  });

  if (!grievance) throw new ApiError(404, "Grievance not found");

  grievance.is_deleted = true;
  await grievance.save();

  return res.status(200).json(new ApiResponse(200, {}, "Grievance deleted"));
});


// ─────────────────────────────────────────────────────────────────────────────
// GET /api/grievance/:id/status
// ─────────────────────────────────────────────────────────────────────────────
export const getGrievanceStatus = asyncHandler(async (req, res) => {
  // Returns just the status field — lightweight call for status tracking page
  const grievance = await Grievance.findOne({
    _id: req.params.id,
    userId: req.user._id,
    is_deleted: false,
  }).select("status updatedAt departmentId assignedOfficerId category priorityScore");

  if (!grievance) throw new ApiError(404, "Grievance not found");

  return res.status(200).json(new ApiResponse(200, grievance));
});