import mongoose from "mongoose";

const { Schema } = mongoose;

const statusLogSchema = new Schema(
  {
    grievanceId: {
      type: Schema.Types.ObjectId,
      ref: "Grievance",
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    changedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    oldStatus: {
      type: String,
      required: true,
      trim: true,
    },

    newStatus: {
      type: String,
      required: true,
      trim: true,
    },

    remark: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const StatusLog = mongoose.model("StatusLog", statusLogSchema);
