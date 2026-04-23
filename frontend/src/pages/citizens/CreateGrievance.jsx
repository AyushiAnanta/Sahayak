import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  createGrievance,
  uploadGrievanceFile,
} from "../../api/grievance";
import { useTranslation } from "react-i18next"; 
import Navbar from "../../components/Navbar";


const LANG_TO_RECOGNITION = {
  en: "en-IN",
  hi: "hi-IN",
  bn: "bn-IN",
  mr: "mr-IN",
};

const CATEGORY_MAP = {
  Agriculture: ["cropDamage", "irrigationIssue", "fertilizerSupply", "pestControl", "other"],
  ConsumerAffairs: ["overcharging", "defectiveProduct", "falseAdvertisement", "refundIssue", "other"],
  Education: ["schoolInfrastructure", "teacherAbsence", "scholarship", "midDayMeal", "other"],
  Electricity: ["powerCut", "streetLight", "billIssue", "meterFault", "other"],
  Food: ["rationCard", "pdsSupply", "foodQuality", "distributionDelay", "other"],
  General: ["generalComplaint", "informationRequest", "other"],
  Healthcare: ["hospitalService", "medicineAvailability", "ambulance", "sanitation", "other"],
  Labour: ["wageDispute", "workplaceSafety", "employment", "childLabour", "other"],
  Road: ["potholes", "constructionDelay", "roadDamage", "signage", "other"],
  Water: ["noSupply", "leakage", "dirtyWater", "pipelineRepair", "other"],
};
const CreateGrievance = () => {
  const { t, i18n } = useTranslation();
const LANGUAGES = [
  
  { label: t("english"), value: "en" },
  { label: t("hindi"), value: "hi" },
  { label: t("bengali"), value: "bn" },
  { label: t("marathi"), value: "mr" },
];

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const recognitionRef = useRef(null);

  const [form, setForm] = useState({
    inputType: "text",
    originalText: "",
    originalLanguage: "en",
    category: "",
    subCategory: "",
    district: "",
    pincode: "",
    file: null,
    proofImage: null,
  });

  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);

  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported. Please use Chrome or Edge.");
      return;
    }

    if (recording) return;

    const recognition = new SpeechRecognition();
    recognition.lang = LANG_TO_RECOGNITION[form.originalLanguage] || "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    recognitionRef.current = recognition;
    setRecording(true);

    recognition.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          const text = e.results[i][0].transcript.trim();
          if (text) {
            setForm((prev) => ({
              ...prev,
              originalText: (prev.originalText + " " + text).trimStart(),
            }));
          }
        }
      }
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e.error);
      setRecording(false);
    };

    recognition.onend = () => setRecording(false);

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };


  const handleFile = async (file) => {
    setForm((prev) => ({ ...prev, file }));
    setError("");

    try {
      setUploadingFile(true);
      const res = await uploadGrievanceFile(file);
      const { url, extractedText, translatedText, detectedLanguage } = res.data.data;

      setUploadedFileUrl(url);

      const text = translatedText || extractedText || "";
      setOcrText(text);

      setForm((prev) => ({
        ...prev,
        originalText: text,
        originalLanguage: detectedLanguage || prev.originalLanguage,
      }));
    } catch (err) {
      console.error("[upload] failed:", err);
      setError("File upload failed. Please try again.");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleProof = (file) => setForm({ ...form, proofImage: file });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "category") {
      setForm({ ...form, category: value, subCategory: "" });
    } else {
      setForm({ ...form, [name]: value });
    }
    setError("");
  };


  const handleSubmit = async () => {
    if (!form.district || !form.pincode) {
      setError("Fill required fields");
      return;
    }

    if ((form.inputType === "image" || form.inputType === "pdf") && !form.originalText) {
      setError("Could not extract text from the file. Please type your complaint manually.");
      return;
    }

    if (!form.originalText) {
      setError("Please describe your issue.");
      return;
    }

    try {
      setLoading(true);

      let fileUrl = uploadedFileUrl;
      let proofUrl = "";

      if (form.proofImage) {
        const res = await uploadGrievanceFile(form.proofImage);
        proofUrl = res.data.data.url;
      }

      await createGrievance({
        inputType: form.inputType,
        originalText: form.originalText,
        district: form.district,
        pincode: form.pincode,
        input_url: fileUrl,
        proof_url: proofUrl,
      });

      navigate("/dashboard/complaints");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1f1f23] text-white">
      <Navbar
        user={user}
        onLogout={() => {
          localStorage.removeItem("user");
          window.location.href = "/login";
        }}
      />

      <div className="pt-24 max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-[#e8d4a2] mb-6">
          {t("createGrievance")}
        </h1>

        <div className="bg-[#2a2a2f] p-8 rounded-xl shadow-lg">

          {/* INPUT TYPE */}
          <select
            name="inputType"
            value={form.inputType}
            onChange={handleChange}
            className="w-full p-3 mb-6 bg-[#1f1f23] border border-gray-600 rounded-lg"
          >
            <option value="text">{t("text")}</option>
            <option value="audio">{t("audio")}</option>
            <option value="image">{t("image")}</option>
            <option value="pdf">{t("pdf")}</option>
          </select>

          {/* TEXT INPUT */}
          {form.inputType === "text" && (
            <textarea
              name="originalText"
              rows="4"
              placeholder={t("descriptionPlaceholder")}
              value={form.originalText}
              className="w-full p-4 mb-6 bg-[#1f1f23] border border-gray-600 rounded-lg"
              onChange={handleChange}
            />
          )}

          {/* AUDIO INPUT */}
          {form.inputType === "audio" && (
            <div className="mb-6">
              <div className="relative w-full">
                <textarea
                  name="originalText"
                  value={form.originalText}
                  onChange={handleChange}
                 placeholder={t("speakOrTypeComplaint")}
                  rows={4}
                  className="w-full p-4 pr-16 bg-[#1f1f23] border border-gray-600 rounded-2xl focus:outline-none focus:border-[#6c584c] resize-none"
                />
                <button
                  onClick={recording ? stopListening : startListening}
                  type="button"
                  title={recording ? "Stop listening" : "Start speaking"}
                  className={`absolute right-3 bottom-3 w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all
                    ${recording
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-white text-black hover:scale-105"
                    }`}
                >
                  🎤
                </button>
              </div>
            <p className="text-xs text-gray-400 mt-2">
            {recording
              ? t("listening", {
                  language:
                    LANGUAGES.find((l) => l.value === form.originalLanguage)?.label ||
                    t("selectedLanguage"),
                })
              : t("selectLanguageInstruction")}
          </p>
            </div>
          )}

          {/* FILE / IMAGE / PDF INPUT */}
          {(form.inputType === "image" || form.inputType === "pdf") && (
            <div className="mb-6">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFile(e.dataTransfer.files[0]);
                }}
                className="border-2 border-dashed border-gray-600 p-6 rounded-xl text-center"
              >
                {uploadingFile ? (
                  <p className="text-yellow-400">⏳ {t("uploadingExtracting")}</p>
                ) : (
                  <>
                       {t("dragDropOr")}

                    <input
                      type="file"
                      hidden
                      id="fileUpload"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFile(e.target.files[0])}
                    />
                    <label htmlFor="fileUpload" className="underline ml-2 cursor-pointer">
                       {t("selectFile")}
                    </label>
                    {form.file && (
                      <p className="text-green-400 mt-2">{form.file.name}</p>
                    )}
                  </>
                )}
              </div>

              {form.originalText ? (
                <div className="mt-4">
                  <p className="text-xs text-gray-400 mb-1">
                    ✅ {t("textExtracted")}
                  </p>
                  <textarea
                    name="originalText"
                    rows="4"
                    value={form.originalText}
                    onChange={handleChange}
                    className="w-full p-4 bg-[#1f1f23] border border-gray-600 rounded-lg"
                  />
                </div>
              ) : form.file && !uploadingFile ? (
                <div className="mt-4">
                  <p className="text-xs text-yellow-400 mb-1">
                   {t("textExtractionFailed")}
                  </p>
                  <textarea
                    name="originalText"
                    rows="4"
                    placeholder={t("typeComplaint")}
                    value={form.originalText}
                    onChange={handleChange}
                    className="w-full p-4 bg-[#1f1f23] border border-gray-600 rounded-lg"
                  />
                </div>
              ) : null}
            </div>
          )}

          {/* LANGUAGE, CATEGORY, LOCATION FIELDS */}
          <div className="grid md:grid-cols-2 gap-5">
            <select
              name="originalLanguage"
              value={form.originalLanguage}
              onChange={(e) => {
    handleChange(e);
    i18n.changeLanguage(e.target.value); }}
              className="p-3 bg-[#1f1f23] border border-gray-600 rounded-lg"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="p-3 bg-[#1f1f23] border border-gray-600 rounded-lg"
            >
              <option value="">{t("category")}</option>

            {Object.keys(CATEGORY_MAP).map((c) => (
              <option key={c} value={c}>
                {t(c)}
              </option>
            ))}
            </select>

            <select
              name="subCategory"
              value={form.subCategory}
              onChange={handleChange}
              disabled={!form.category}
              className="p-3 bg-[#1f1f23] border border-gray-600 rounded-lg disabled:opacity-50"
            >
          <option value="">{t("subCategory")}</option>

          {form.category &&
            CATEGORY_MAP[form.category].map((s) => (
              <option key={s} value={s}>
                {t(s)}
              </option>
            ))}
            </select>

            <input
              name="district"
              placeholder={t("district")}
              className="p-3 bg-[#1f1f23] border border-gray-600 rounded-lg"
              onChange={handleChange}
            />

            <input
              name="pincode"
              placeholder={t("pincode")}
              maxLength={6}
              inputMode="numeric"
              className="p-3 bg-[#1f1f23] border border-gray-600 rounded-lg"
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                setForm((prev) => ({ ...prev, pincode: val }));
              }}
            />
          </div>

          {/* PROOF IMAGE UPLOAD */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleProof(e.dataTransfer.files[0]);
            }}
            className="mt-6 border-2 border-dashed border-gray-600 p-8 rounded-xl text-center bg-[#1f1f23] hover:border-[#6c584c] transition"
          >
            <p className="text-3xl mb-2">📁</p>
            <p className="text-lg font-medium text-gray-300">
               {t("dragDropProof")}
            </p>
            <p className="text-sm text-gray-500 mt-1 mb-3"> {t("or")}</p>
            <input
              type="file"
              hidden
              id="proofUpload"
              accept="image/*"
              onChange={(e) => handleProof(e.target.files[0])}
            />
            <label
              htmlFor="proofUpload"
              className="inline-block px-4 py-2 bg-[#6c584c] text-white rounded-lg cursor-pointer hover:opacity-90 transition"
            >
              {t("selectImage")}
            </label>
            {form.proofImage && (
              <p className="text-green-400 mt-3 text-sm">✓ {form.proofImage.name}</p>
            )}
          </div>

          {error && <p className="text-red-400 mt-4">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading || uploadingFile}
            className="w-full mt-6 bg-[#6c584c] py-3 rounded-lg disabled:opacity-60 hover:opacity-90 transition"
          >
            {loading
  ? t("submitting"): uploadingFile ? t("processingFile"): t("submit")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGrievance;
