import mongoose from "mongoose";
import bcrypt from "bcryptjs"; 

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
      minlength: 6,
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
      enum: ["Hindi", "Tamil", "Marathi", "English"],
      default: "English",
    },

    oauthProvider: {
      type: String,
    },

    role: {
      type: String,
      enum: ["user", "officer", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (
    !this.isModified("password") ||
    this.oauthProvider === "google"
  )
    return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);
