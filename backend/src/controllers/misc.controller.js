import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// GET /api/health
export const healthCheck = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, {
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "AI Grievance Management API",
  }));
});


// GET /api/location
export const getLocations = asyncHandler(async (req, res) => {
  const locations = [
    { district: "Kotputli", pincodes: ["303108", "303109"] },
    { district: "Alwar", pincodes: ["301001", "301002"] },
    { district: "Laxmangarh", pincodes: ["332311", "332312"] },
  ];
  return res.status(200).json(new ApiResponse(200, locations));
});


// GET /api/languages 
export const getSupportedLanguages = asyncHandler(async (req, res) => {
  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "ta", name: "Tamil" },
    { code: "mr", name: "Marathi" },
  ];
  return res.status(200).json(new ApiResponse(200, languages));
});