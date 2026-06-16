import { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaPaperPlane,
  FaPhone,
  FaVideo,
  FaInfoCircle,
  FaEnvelope,
} from "react-icons/fa";
import { useAuthStore } from "../../store/useAuthStore";
import { useMessageStore } from "../../store/useMessageStore";
import { io } from "socket.io-client";
import { axiosInstance } from "../../lib/axios";
import { useLocation, useNavigate } from "react-router-dom";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function MessagesPage() {
  const { authUser } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    conversations,
    selectedConversation,
    messages,
    fetchConversations,
    createConversation,
    selectConversation,
    sendMessage,
    addReceivedMessage,
  } = useMessageStore();

  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());

  const otherParticipant = useMemo(
    () =>
      selectedConversation?.participants?.find((p) => p._id !== authUser?._id),
    [selectedConversation, authUser],
  );

  // Initialize Socket.io connection
  useEffect(() => {
    if (!authUser) return;

    const newSocket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem("token") || "",
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      newSocket.emit("user:join", authUser._id);
    });

    newSocket.on("message:receive", (data) => {
      if (selectedConversation?.conversationId === data.conversationId) {
        addReceivedMessage({
          _id: data._id || Date.now(),
          sender: { _id: data.senderId },
          text: data.message,
          createdAt: data.timestamp || new Date().toISOString(),
        });
      }
    });

    newSocket.on("user:typing", (data) => {
      setTypingUsers((prev) => new Set(prev).add(data.senderId));
    });

    newSocket.on("user:stoppedTyping", (data) => {
      setTypingUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(data.senderId);
        return updated;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [authUser, addReceivedMessage, selectedConversation]);

  // Fetch conversations and users on mount
  useEffect(() => {
    if (!authUser) return;
    fetchConversations();
    fetchAllUsers();
  }, [authUser, fetchConversations]);

  // If navigated with selectedUser (from post 3-dot menu), auto-start chat
  useEffect(() => {
    const selectedUser = location.state?.selectedUser;
    if (selectedUser?._id) {
      handleStartChat(selectedUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Fetch all users for "New Message"
  const fetchAllUsers = async () => {
    try {
      const response = await axiosInstance.get("/auth/users");
      const filteredUsers = response.data.filter(
        (user) => user._id !== authUser?._id,
      );
      setAllUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    const recipientId = selectedConversation.participants.find(
      (p) => p._id !== authUser._id,
    )?._id;

    if (!recipientId) return;

    await sendMessage(recipientId, messageText);

    if (socket) {
      const conversationId = [authUser._id, recipientId].sort().join("-");
      socket.emit("message:send", {
        conversationId,
        senderId: authUser._id,
        recipientId,
        message: messageText,
      });
    }

    setMessageText("");
    setTypingUsers(new Set());
  };

  const handleStartChat = async (user) => {
    try {
      const conversation = await createConversation(user._id);
      if (conversation) {
        await selectConversation(conversation.conversationId);
        setShowNewChat(false);
        setSearchQuery("");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const handleSelectConversation = async (conversation) => {
    await selectConversation(conversation.conversationId);
  };

  const handleTyping = () => {
    if (!selectedConversation || !socket) return;

    const recipientId = selectedConversation.participants.find(
      (p) => p._id !== authUser._id,
    )?._id;

    if (!recipientId) return;

    socket.emit("user:typing", {
      recipientId,
      senderId: authUser._id,
    });

    setTimeout(() => {
      socket.emit("user:stoppedTyping", {
        recipientId,
        senderId: authUser._id,
      });
    }, 1200);
  };

  const filteredUsers = allUsers.filter((user) =>
    user.fullname?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredConversations = conversations.filter((conv) =>
    conv.participants?.some((p) =>
      p.fullname?.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  return (
    <div className="w-full h-full flex bg-[#0f0f0f] overflow-hidden">
      {/* Sidebar - Conversations List */}
      <div className="w-80 bg-[#1e1e1e] border-r border-gray-700 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <h1 className="text-white font-bold text-xl mb-4">Messages</h1>

          {/* Search Bar */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-500 text-sm" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 text-white placeholder-gray-500 pl-9 pr-4 py-2 rounded-full text-sm border border-gray-700 focus:border-cyan-400 outline-none"
            />
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-gray-700 flex-shrink-0">
          <button
            onClick={() => setShowNewChat(!showNewChat)}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-2 rounded-full hover:opacity-90 transition text-sm"
          >
            {showNewChat ? "Cancel" : "+ New Message"}
          </button>
        </div>

        {/* New Chat Search */}
        {showNewChat && (
          <div className="p-3 border-b border-gray-700 bg-gray-900/50 flex-shrink-0 max-h-48 overflow-y-auto">
            <p className="text-gray-400 text-xs mb-2">Select a person:</p>
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleStartChat(user)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg transition"
                >
                  <img
                    src={user.profilePhoto || "https://via.placeholder.com/36"}
                    alt={user.fullname}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <span className="text-white text-sm">{user.fullname}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <button
                key={conversation._id}
                onClick={() => handleSelectConversation(conversation)}
                className={`w-full text-left p-3 border-b border-gray-800 hover:bg-gray-900 transition ${
                  selectedConversation?._id === conversation._id
                    ? "bg-gray-900 border-l-2 border-l-cyan-400"
                    : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={
                      conversation.participants?.find(
                        (p) => p._id !== authUser._id,
                      )?.profilePhoto || "https://via.placeholder.com/44"
                    }
                    alt="User"
                    className="h-11 w-11 rounded-full flex-shrink-0 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-white font-semibold text-sm">
                        {conversation.participants?.find(
                          (p) => p._id !== authUser._id,
                        )?.fullname || "User"}
                      </p>
                      <span className="text-gray-500 text-xs">
                        {conversation.lastMessageTime
                          ? new Date(
                              conversation.lastMessageTime,
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs truncate">
                      {conversation.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-10 px-4">
              <p className="text-gray-400 text-sm">No conversations</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col h-full bg-[#0f0f0f]">
          {/* Chat Header */}
          <div className="bg-[#1e1e1e] border-b border-gray-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div
              className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition"
              onClick={() =>
                otherParticipant?._id &&
                navigate(`/profile/${otherParticipant._id}`)
              }
            >
              <img
                src={
                  otherParticipant?.profilePhoto ||
                  "https://via.placeholder.com/44"
                }
                alt={otherParticipant?.fullname}
                className="h-11 w-11 rounded-full object-cover"
              />
              <div>
                <p className="text-white font-bold hover:underline">
                  {otherParticipant?.fullname || "User"}
                </p>
                <p className="text-gray-500 text-xs">Active now</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button aria-label="Audio call" className="text-gray-400 hover:text-cyan-400 transition text-lg">
                <FaPhone />
              </button>
              <button aria-label="Video call" className="text-gray-400 hover:text-cyan-400 transition text-lg">
                <FaVideo />
              </button>
              <button
                aria-label="View Profile"
                className="text-gray-400 hover:text-cyan-400 transition text-lg"
                onClick={() =>
                  otherParticipant?._id &&
                  navigate(`/profile/${otherParticipant._id}`)
                }
                title="View Profile"
              >
                <FaInfoCircle />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={msg._id || index}
                  className={`flex ${msg.sender._id === authUser._id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      msg.sender._id === authUser._id
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-none"
                        : "bg-gray-800 text-gray-100 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm break-words">{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 text-sm">
                  No messages yet. Start the conversation!
                </p>
              </div>
            )}

            {typingUsers.size > 0 && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-gray-300 px-4 py-2 rounded-2xl rounded-bl-none">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="bg-[#1e1e1e] border-t border-gray-700 p-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Write a message..."
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-gray-900 text-white placeholder-gray-500 px-4 py-3 rounded-full text-sm border border-gray-700 focus:border-cyan-400 outline-none"
              />
              <button
                onClick={handleSendMessage}
                aria-label="Send message"
                disabled={!messageText.trim()}
                className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-90 disabled:opacity-50 text-black font-bold p-3 rounded-full transition"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#0f0f0f]">
          <div className="text-center">
            <FaEnvelope className="h-16 w-16 text-gray-600 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 text-lg">Select a conversation</p>
          </div>
        </div>
      )}
    </div>
  );
}
