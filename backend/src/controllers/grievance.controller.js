import fs from "fs";
import { Grievance } from "../models/grievance.model.js";
import { Notification } from "../models/notification.model.js";
import { StatusLog } from "../models/statusLog.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmailNotification } from "../utils/email.js";
// Import AI helpers — these call Python internally, no HTTP needed from frontend
import {
  runTranslate,
  runClassify,
  runDuplicateCheck,
  runExplain,
  runOCR,
  saveAILog,
} from "./ai.controller.js";


export const uploadGrievanceFile = asyncHandler(async (req, res) => {
  console.log("hereeeeeeeee")
  const localPath = req.file?.path;
  if (!localPath) throw new ApiError(400, "No file provided");

  const extension = req.file.originalname.split(".").pop().toLowerCase();
  const inputType = extension === "pdf" ? "pdf" : "image";

  const extractedText = await runOCR(localPath, req.file.originalname, req.file.mimetype);
  console.log(`[upload] OCR extracted ${extractedText.length} chars`);

  const uploaded = await uploadOnCloudinary(localPath);
  if (!uploaded) throw new ApiError(500, "Cloudinary upload failed");

  let translatedText = extractedText;
  let detectedLanguage = "en";

  if (extractedText.length > 10) {
    const translated = await runTranslate(extractedText, "en");
    translatedText = translated.translatedText;
    detectedLanguage = translated.detectedLanguage;
  }

  try { if (fs.existsSync(localPath)) fs.unlinkSync(localPath); } catch (_) {}

  return res.status(200).json(new ApiResponse(200, {
    url: uploaded.url,
    inputType,
    extractedText,
    translatedText,
    detectedLanguage,
  }, "File uploaded and processed"));
});

export const createGrievance = asyncHandler(async (req, res) => {
  const {
    inputType,
    originalText,
    originalLanguage,
    translatedText,  
    district,
    pincode,
    input_url,   
    preferredLanguage, 
  } = req.body;

  if (!inputType || !originalText || !district || !pincode) {
    throw new ApiError(400, "inputType, originalText, district and pincode are required");
  }

  const startTime = Date.now();

  let finalTranslatedText = translatedText;
  let finalOriginalLanguage = originalLanguage;

  if (!finalTranslatedText) {
    const translated = await runTranslate(originalText, "en");
    finalTranslatedText = translated.translatedText;
    finalOriginalLanguage = translated.detectedLanguage;
  }

  const classification = await runClassify(finalTranslatedText);
  console.log(`[create] Classified as: ${classification.category} (${classification.subCategory})`);

  const userLang = preferredLanguage || finalOriginalLanguage || "en";
  const summaryUserLang = await runExplain(finalTranslatedText, userLang);

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
    category: classification.category,
    subCategory: classification.subCategory,
    keywords: classification.keywords,
    priorityScore: classification.priorityScore,
    summaryText: classification.summaryText,
    summaryUserLang,
  });

  const duplicateResult = await runDuplicateCheck(grievance._id.toString(), finalTranslatedText);
  if (duplicateResult.isDuplicate) {
    console.log(`[create] Duplicate detected — similar to: ${duplicateResult.similarGrievances.map(g => g.id).join(", ")}`);
  }

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

  await Notification.create({
    userId: req.user._id,
    grievanceId: grievance._id,
    message: `Your grievance has been submitted and classified under ${classification.category}. ID: ${grievance._id}`,
    notification_type: "Initiated",
    status: "unread",
  });

  await sendEmailNotification({
    toEmail: req.user.email,
    toName:  req.user.name,
    message: `Your grievance has been submitted and classified under ${classification.category}. ID: ${grievance._id}`,
    notification_type: "Initiated",
    grievanceId: grievance._id.toString(),
    district: grievance.district,
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


export const getUserGrievances = asyncHandler(async (req, res) => {
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

export const getGrievanceById = asyncHandler(async (req, res) => {
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


export const editGrievance = asyncHandler(async (req, res) => {
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


// DELETE /api/grievance/:id

export const deleteGrievance = asyncHandler(async (req, res) => {
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


// GET /api/grievance/:id/status
export const getGrievanceStatus = asyncHandler(async (req, res) => {
  const grievance = await Grievance.findOne({
    _id: req.params.id,
    userId: req.user._id,
    is_deleted: false,
  }).select("status updatedAt departmentId assignedOfficerId category priorityScore");

  if (!grievance) throw new ApiError(404, "Grievance not found");

  return res.status(200).json(new ApiResponse(200, grievance));
});