import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    unique: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  lastMessage: {
    type: String,
    default: "",
  },
  lastMessageTime: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Conversation = mongoose.model("Conversation", conversationSchema);
