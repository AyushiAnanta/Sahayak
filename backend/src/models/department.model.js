import mongoose from "mongoose";

const { Schema } = mongoose;

const departmentSchema = new Schema(
  {
    name: {
      type: String,
      requiredd: true,
      unique: true,
      trim: true,
      index: true,
      enum:["General", "Electricity", "Water", "Road", "Healthcare", "Food", "Labour", "Agriculture", "Education", "ConsumerAffairs"],
      default: "General"
    },

    email: {
      type: String,
      requiredd: true,
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
        type: String,
        requiredd: true,
        index: true,
        trim : true
    },

    category_handled: {
      type: String,
      requiredd: true,
      index: true,
      trim : false,
      enum:["General", "Electricity", "Water", "Road", "Healthcare", "Food", "Labour", "Agriculture", "Education", "ConsumerAffairs"],
      default: "General"
  },

    district:{
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      enum:["Kotputli", "Alwar", "Laxmangarh", "Los Santos", "Wyoming"]
    },
    pincode:{
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

  },
  {
    timestamps: true,
  }
);

export const Department = mongoose.model("Department", departmentSchema);
