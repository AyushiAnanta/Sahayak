import mongoose from "mongoose";

const { Schema } = mongoose;

const departmentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      enum:["General", "Electricity", "Water", "Road", "Healthcare", "Food", "Labour", "Agriculture", "Education", "ConsumerAffairs"],
      default: "General"
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+\@.+\..+/, "Please enter a valid email"],
      index: true,
    },

    phone: {
        type: String,
        trim: true,
    },

    deptHead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
        trim : true
    },

    officers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],

    category: {
      type: String,
      required: true,
      index: true,
      trim : false,
      enum:["General", "Electricity", "Water", "Road", "Healthcare", "Food", "Labour", "Agriculture", "Education", "ConsumerAffairs"],
      default: "General"
  },

    district:{
      type: String,
      require: true,
      lowercase: true,
      lowercase: true,
      trim: true,
      enum:["Kotputli", "Alwar", "Laxmangarh", "Jaipur", "Dausa"]
    },
    pincode:{
      type: String,
      require: true,
      lowercase: true,
      trim: true
    },

  },
  {
    timestamps: true,
  }
);

export const Department = mongoose.model("Department", departmentSchema);
