import { Message } from "../models/message.models.js";
import { Conversation } from "../models/conversation.models.js";
import User from "../models/user.models.js";

// Send Message
export const sendMessage = async (req, res) => {
  try {
    const { recipientId, text } = req.body;
    const senderId = req.user._id;

    if (!recipientId || !text.trim()) {
      return res
        .status(400)
        .json({ error: "Recipient and message text are required" });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    // Create conversation ID (sorted to ensure consistent IDs)
    const conversationId = [senderId, recipientId].sort().join("-");

    // Get or create conversation
    let conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      conversation = new Conversation({
        conversationId,
        participants: [senderId, recipientId],
      });
    }

    // Create message
    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      text,
      conversationId,
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = text;
    conversation.lastMessageTime = new Date();
    await conversation.save();

    // Populate sender and recipient info
    await message.populate("sender", "fullname profilePhoto");
    await message.populate("recipient", "fullname profilePhoto");

    res.status(201).json(message);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Get Messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify user is part of conversation
    const [user1, user2] = conversationId.split("-");
    if (user1 !== userId.toString() && user2 !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const messages = await Message.find({ conversationId })
      .populate("sender", "fullname profilePhoto")
      .populate("recipient", "fullname profilePhoto")
      .sort({ createdAt: 1 });

    // Mark all messages for this user as read
    await Message.updateMany(
      { conversationId, recipient: userId, isRead: false },
      { isRead: true },
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// Get All Conversations for a user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({ participants: userId })
      .populate("participants", "fullname profilePhoto")
      .sort({ lastMessageTime: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error in getConversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

// Get or Create Conversation with a user
export const createConversation = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (currentUserId.toString() === userId) {
      return res
        .status(400)
        .json({ error: "Cannot create conversation with yourself" });
    }

    const conversationId = [currentUserId, userId].sort().join("-");

    let conversation = await Conversation.findOne({ conversationId }).populate(
      "participants",
      "fullname profilePhoto",
    );

    if (!conversation) {
      conversation = new Conversation({
        conversationId,
        participants: [currentUserId, userId],
      });
      await conversation.save();
      await conversation.populate("participants", "fullname profilePhoto");
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error in createConversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
};

// Mark message as read
export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true },
    );

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in markAsRead:", error);
    res.status(500).json({ error: "Failed to mark message as read" });
  }
};
