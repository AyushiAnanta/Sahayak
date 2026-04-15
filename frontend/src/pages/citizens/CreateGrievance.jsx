import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createGrievance,
  uploadGrievanceFile,
} from "../../api/grievance";

import Navbar from "../../components/Navbar";

const LANGUAGES = [
  { label: "English", value: "en" },
  { label: "Hindi", value: "hi" },
  { label: "Punjabi", value: "pa" },
  { label: "Bengali", value: "bn" },
  { label: "Marathi", value: "mr" },
];

const CATEGORY_MAP = {
  water: ["Leakage", "No Supply", "Dirty Water"],
  electricity: ["Power Cut", "Street Light", "Bill Issue"],
  road: ["Potholes", "Construction Delay", "Damage"],
  sanitation: ["Garbage", "Drainage", "Cleaning"],
  others: ["General", "Complaint", "Other"],
};

const CreateGrievance = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

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

  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🎤 SPEECH
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";

    setRecording(true);
    recognition.start();

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;

      setForm((prev) => ({
        ...prev,
        originalText: prev.originalText + " " + text,
      }));
    };

    recognition.onend = () => setRecording(false);
  };

  const handleFile = (file) => setForm({ ...form, file });
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
  if (!form.originalText || !form.district || !form.pincode) {
    setError("Fill required fields");
    return;
  }

  try {
    setLoading(true);

    let fileUrl = "";
    let proofUrl = "";

    // upload grievance file
    if (form.file) {
      const res = await uploadGrievanceFile(form.file);
      fileUrl = res.data.data.url;
    }

    // upload proof image
    if (form.proofImage) {
      const res = await uploadGrievanceFile(form.proofImage);
      proofUrl = res.data.data.url;
    }

    await createGrievance({
      inputType: form.inputType,
      originalText: form.originalText,
      originalLanguage: form.originalLanguage,
      district: form.district,
      pincode: form.pincode,
      input_url: fileUrl,
      proof_url: proofUrl
    });

    alert("Complaint submitted!");
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
          Create Grievance
        </h1>

        <div className="bg-[#2a2a2f] p-8 rounded-xl shadow-lg">

          {/* TYPE */}
          <select
            name="inputType"
            value={form.inputType}
            onChange={handleChange}
            className="w-full p-3 mb-6 bg-[#1f1f23] border border-gray-600 rounded-lg"
          >
            <option value="text">Text</option>
            <option value="audio">Audio</option>
            <option value="image">Image</option>
            <option value="pdf">PDF</option>
          </select>

          {/* TEXT */}
          {form.inputType === "text" && (
            <textarea
              name="originalText"
              rows="4"
              placeholder="Describe your issue..."
              className="w-full p-4 mb-6 bg-[#1f1f23] border border-gray-600 rounded-lg"
              onChange={handleChange}
            />
          )}

          {/* 🎤 AUDIO */}
          {form.inputType === "audio" && (
            <div className="mb-6">

              {/* WRAPPER (IMPORTANT) */}
              <div className="relative w-full">

                {/* TEXTAREA */}
                <textarea
                  name="originalText"
                  value={form.originalText}
                  onChange={handleChange}
                  placeholder="Speak or type your complaint..."
                  rows={4}
                  className="w-full p-4 pr-16 bg-[#1f1f23] border border-gray-600 rounded-2xl focus:outline-none focus:border-[#6c584c]"
                />

                <button
                  onClick={startListening}
                  type="button"
                  className={`absolute right-3 bottom-3 w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all
                    ${
                      recording
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-white text-black hover:scale-105"
                    }
                  `}
                >
                  🎤
                </button>

              </div>

              {/* HELPER TEXT */}
              <p className="text-xs text-gray-400 mt-2">
                {recording ? "Listening..." : "Tap mic or type"}
              </p>

            </div>
          )}
          {/* FILE */}
          {(form.inputType === "image" || form.inputType === "pdf") && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFile(e.dataTransfer.files[0]);
              }}
              className="mb-6 border-2 border-dashed border-gray-600 p-6 rounded-xl text-center"
            >
              Drag & Drop or

              <input
            type="file"
            hidden
            id="fileUpload"
            accept="image/*,application/pdf"
            onChange={(e) => handleFile(e.target.files[0])}
          />

              <label htmlFor="fileUpload" className="underline ml-2 cursor-pointer">
                Select File
              </label>

              {form.file && (
                <p className="text-green-400 mt-2">{form.file.name}</p>
              )}
            </div>
          )}

          {/* OTHER */}
          <div className="grid md:grid-cols-2 gap-5">
            <select
              name="originalLanguage"
              value={form.originalLanguage}
              onChange={handleChange}
              className="p-3 bg-[#1f1f23] border border-gray-600 rounded-lg"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="p-3 bg-[#1f1f23] border border-gray-600 rounded-lg"
            >
              <option value="">Category</option>
              {Object.keys(CATEGORY_MAP).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <select
              name="subCategory"
              value={form.subCategory}
              onChange={handleChange}
              disabled={!form.category}
              className="p-3 bg-[#1f1f23] border border-gray-600 rounded-lg"
            >
              <option value="">SubCategory</option>
              {form.category &&
                CATEGORY_MAP[form.category].map((s) => (
                  <option key={s}>{s}</option>
                ))}
            </select>

            <input
              name="district"
              placeholder="District"
              className="p-3 bg-[#1f1f23] border border-gray-600 rounded-lg"
              onChange={handleChange}
            />

            <input
              name="pincode"
              placeholder="Pincode"
              className="p-3 bg-[#1f1f23] border border-gray-600 rounded-lg"
              onChange={handleChange}
            />
          </div>

          {/* 🖼️ PROOF (DRAG + DROP) */}
          <div
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    e.preventDefault();
    handleProof(e.dataTransfer.files[0]);
  }}
  className="mt-6 border-2 border-dashed border-gray-600 p-8 rounded-xl text-center bg-[#1f1f23] hover:border-[#6c584c] transition"
>
  {/* ICON */}
  <p className="text-3xl mb-2">📁</p>

  {/* MAIN TEXT */}
  <p className="text-lg font-medium text-gray-300">
    Drag & drop your image here
  </p>

  {/* OR TEXT */}
  <p className="text-sm text-gray-500 mt-1 mb-3">
    or
  </p>

  {/* HIDDEN INPUT */}
  <input
    type="file"
    hidden
    id="proofUpload"
    accept="image/*"
    onChange={(e) => handleProof(e.target.files[0])}
  />

  {/* BUTTON STYLE LABEL */}
  <label
    htmlFor="proofUpload"
    className="inline-block px-4 py-2 bg-[#6c584c] text-white rounded-lg cursor-pointer hover:opacity-90 transition"
  >
    Select Image
  </label>

  {/* FILE NAME */}
  {form.proofImage && (
    <p className="text-green-400 mt-3 text-sm">
      ✅ {form.proofImage.name}
    </p>
  )}
</div>

          {error && <p className="text-red-400 mt-4">{error}</p>}

          <button
            onClick={handleSubmit}
            className="w-full mt-6 bg-[#6c584c] py-3 rounded-lg"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGrievance;