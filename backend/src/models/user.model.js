import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
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

    avatar: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
       nullable: true,
      select: false, 
    },

    refreshToken: {
      type: String,
      select: false,
    },

    phoneNo: {
      type: String,
      trim: true,
    },

    preferredLanguage: {
      type: String,
      enum:["Hindi","Tamil","Marathi","English"],
      default: "English",
    },

    oauthProvider: {
      type: String, 
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
