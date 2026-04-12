import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createGrievance,
  uploadGrievanceFile,
} from "../../api/grievance";

const CreateGrievance = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    inputType: "text",
    originalText: "",
    originalLanguage: "en",
    category: "",
    subCategory: "",
    district: "",
    pincode: "",
    file: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleFile = (e) => {
    setForm({ ...form, file: e.target.files[0] });
  };

  const handleSubmit = async () => {
    const {
      originalText,
      originalLanguage,
      category,
      district,
      pincode,
    } = form;

    // ✅ VALIDATION
    if (!originalText || !originalLanguage || !district || !pincode) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      let fileUrl = "";

      // 📤 1. Upload file (if exists)
      if (form.file) {
        const uploadRes = await uploadGrievanceFile(form.file);
        fileUrl = uploadRes?.data?.url || "";
      }

      // 📦 2. Create grievance payload
      const payload = {
        inputType: form.inputType,
        originalText: form.originalText,
        originalLanguage: form.originalLanguage,
        category: form.category,
        subCategory: form.subCategory,
        district: form.district,
        pincode: form.pincode,
        input_url: fileUrl,
      };

      // 🚀 3. API CALL
      await createGrievance(payload);

      alert("Grievance submitted successfully!");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1f1f23] text-white p-10">

      <h1 className="text-3xl font-bold mb-6">Create Grievance</h1>

      <div className="bg-white text-black p-8 rounded-xl max-w-2xl">

        {/* INPUT TYPE */}
        <select
          name="inputType"
          value={form.inputType}
          onChange={handleChange}
          className="w-full p-3 mb-4 border rounded"
        >
          <option value="text">Text</option>
          <option value="image">Image</option>
          <option value="audio">Audio</option>
          <option value="pdf">PDF</option>
        </select>

        {/* TEXT */}
        <textarea
          name="originalText"
          placeholder="Enter your complaint *"
          className="w-full p-3 mb-4 border rounded"
          onChange={handleChange}
        />

        {/* LANGUAGE */}
        <input
          name="originalLanguage"
          placeholder="Language (en, hi...) *"
          className="w-full p-3 mb-4 border rounded"
          onChange={handleChange}
        />

        {/* FILE */}
        <input
          type="file"
          onChange={handleFile}
          className="mb-4"
        />

        {/* CATEGORY */}
        <input
          name="category"
          placeholder="Category"
          className="w-full p-3 mb-4 border rounded"
          onChange={handleChange}
        />

        <input
          name="subCategory"
          placeholder="Sub Category"
          className="w-full p-3 mb-4 border rounded"
          onChange={handleChange}
        />

        {/* LOCATION */}
        <input
          name="district"
          placeholder="District *"
          className="w-full p-3 mb-4 border rounded"
          onChange={handleChange}
        />

        <input
          name="pincode"
          placeholder="Pincode *"
          className="w-full p-3 mb-4 border rounded"
          onChange={handleChange}
        />

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#6c584c] text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default CreateGrievance;