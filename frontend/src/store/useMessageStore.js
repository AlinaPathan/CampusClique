import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useMessageStore = create((set, get) => ({
  conversations: [],
  selectedConversation: null,
  messages: [],
  loading: false,

  // Fetch all conversations for logged-in user
  fetchConversations: async () => {
    try {
      set({ loading: true });
      const response = await axiosInstance.get("/messages/conversations");
      set({ conversations: response.data });
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      set({ loading: false });
    }
  },

  // Get or create conversation with a user
  createConversation: async (userId) => {
    try {
      const response = await axiosInstance.post("/messages/conversations", {
        userId,
      });
      const newConversation = response.data;

      // Add to conversations list if not already there
      set((state) => ({
        conversations: [
          newConversation,
          ...state.conversations.filter((c) => c._id !== newConversation._id),
        ],
        selectedConversation: newConversation,
      }));

      return newConversation;
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  },

  // Select a conversation and fetch its messages
  selectConversation: async (conversationId) => {
    try {
      set({ loading: true });
      const response = await axiosInstance.get(`/messages/${conversationId}`);

      // Find conversation object
      const conversation = get().conversations.find(
        (c) => c.conversationId === conversationId,
      );

      set({
        selectedConversation: conversation,
        messages: response.data,
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      set({ loading: false });
    }
  },

  // Send a message
  sendMessage: async (recipientId, text) => {
    try {
      const response = await axiosInstance.post("/messages/send", {
        recipientId,
        text,
      });

      // Update messages
      set((state) => ({
        messages: [...state.messages, response.data],
      }));

      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
    }
  },

  // Add received message to messages list (from Socket.io)
  addReceivedMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  // Clear messages
  clearMessages: () => {
    set({
      messages: [],
      selectedConversation: null,
    });
  },
}));
