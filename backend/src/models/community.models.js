import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    avatar: {
      type: String,
      default: "🌐",
    },
    coverImage: {
      type: String,
      default: "",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    moderators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    category: {
      type: String,
      enum: [
        "technology",
        "education",
        "sports",
        "arts",
        "career",
        "lifestyle",
        "other",
      ],
      default: "other",
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Virtual for member count
communitySchema.virtual("memberCount").get(function () {
  return this.members.length;
});

// Ensure virtuals are included in JSON
communitySchema.set("toJSON", { virtuals: true });
communitySchema.set("toObject", { virtuals: true });

const Community = mongoose.model("Community", communitySchema);

export default Community;
