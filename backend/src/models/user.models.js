import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },

    collegeName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["student", "mentor", "admin", "system_admin", "college_admin"],
      default: null,
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    bio: {
      type: String,
      maxlength: 300,
    },

    location: {
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
    },

    linkedinUrl: {
      type: String,
      trim: true,
    },

    githubUrl: {
      type: String,
      trim: true,
    },

    expertise: {
      type: String,
      trim: true,
    },

    yearsOfExperience: {
      type: Number,
      min: 0,
    },

    collegeCode: {
      type: String,
      trim: true,
    },

    profilePhoto: {
      type: String, // store image URL or file path
    },

    profileBackground: {
      type: String, // store image URL or file path
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    settings: {
      darkMode: { type: Boolean, default: true },
      notifications: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: false },
      privateAccount: { type: Boolean, default: false },
      soundEnabled: { type: Boolean, default: true },
      language: { type: String, default: "English" },
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);
export default User;
