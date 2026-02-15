import mongoose from "mongoose";

const { Schema } = mongoose;

const aiProcessingLogSchema = new Schema(
  {
    grievanceId: {
      type: Schema.Types.ObjectId,
      ref: "Grievance",
      required: true,
      index: true,
    },

    detectedLanguage: {
      type: String,
      required: true,
      trim: true,
    },

    translatedText: {
      type: String,
      trim: true,
    },

    classificationResult: {
      type: String,
      trim: true,
    },

    priorityScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    processingTimeMs: {
      type: Number,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Success", "Failed", "Pending"],
      default: "Pending",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

export const AIProcessingLog = mongoose.model("AIProcessingLog",aiProcessingLogSchema );
