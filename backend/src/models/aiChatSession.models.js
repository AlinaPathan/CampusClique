import mongoose from "mongoose";

const aiChatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "model"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const aiChatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    messages: {
      type: [aiChatMessageSchema],
      default: [],
    },
  },
  { timestamps: true },
);

aiChatSessionSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

const AiChatSession = mongoose.model("AiChatSession", aiChatSessionSchema);

export default AiChatSession;
