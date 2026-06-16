import { useEffect, useRef, useState } from "react";
import { axiosInstance } from "../../lib/axios";
import { useAuthStore } from "../../store/useAuthStore";
import ReactMarkdown from "react-markdown";

const defaultAssistantMessage = {
  role: "assistant",
  content:
    "Hi! I am CampusClique AI. Ask me anything about your campus or profile.",
};

const getStoredSessionId = () => {
  const existing = localStorage.getItem("campusclique_ai_session_id");
  if (existing) return existing;

  const generated = `session-${Date.now()}`;
  localStorage.setItem("campusclique_ai_session_id", generated);
  return generated;
};

const AiChatWidget = () => {
  const { authUser } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef(null);
  const [chatMessages, setChatMessages] = useState([defaultAssistantMessage]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const sessionIdRef = useRef(getStoredSessionId());
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [chatMessages, isOpen]);

  const handleSendChat = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || isSendingChat) return;

    const nextMessages = [
      ...chatMessages,
      {
        role: "user",
        content: trimmed,
      },
    ];

    setChatMessages(nextMessages);
    setChatInput("");
    setIsSendingChat(true);

    try {
      const response = await axiosInstance.post("/ai/chat", {
        message: trimmed,
        sessionId: sessionIdRef.current,
      });

      const reply = response.data?.reply || "Sorry, I could not respond.";
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);
    } catch (error) {
      console.error("AI chat error:", error);
      const errorMessage =
        error.response?.data?.details ||
        error.response?.data?.message ||
        "AI is unavailable right now. Please try again later.";
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleClearChat = async () => {
    if (isSendingChat) return;

    try {
      await axiosInstance.delete("/ai/chat/history", {
        params: { sessionId: sessionIdRef.current },
      });
      setChatMessages([defaultAssistantMessage]);
    } catch (error) {
      console.error("Failed to clear AI history:", error);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event) => {
      if (!widgetRef.current) return;
      if (!widgetRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchHistory = async () => {
      if (!authUser?._id) return;

      setIsLoadingHistory(true);
      try {
        const response = await axiosInstance.get("/ai/chat/history", {
          params: { sessionId: sessionIdRef.current },
        });

        const history = response.data?.messages || [];
        if (!history.length) {
          setChatMessages([defaultAssistantMessage]);
          return;
        }

        setChatMessages((prev) => {
          const first = prev[0];
          const hasDefaultIntro =
            first?.role === "assistant" &&
            first?.content === defaultAssistantMessage.content;

          return hasDefaultIntro ? [first, ...history] : history;
        });
      } catch (error) {
        console.error("Failed to load AI history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [isOpen, authUser?._id]);

  return (
    <>
      {isOpen && (
        <div
          ref={widgetRef}
          className="fixed bottom-20 right-6 w-95 max-w-[92vw] bg-[#141820] border border-gray-700 rounded-2xl p-4 shadow-xl z-50"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold text-lg">AI Assistant</h3>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearChat}
                className="text-gray-400 hover:text-white text-xs"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                Close
              </button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-3 pr-2">
            {isLoadingHistory && (
              <div className="text-xs text-gray-400">
                Loading previous chat...
              </div>
            )}
            {chatMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`text-sm rounded-lg px-3 py-2 ${
                  message.role === "user"
                    ? "bg-cyan-500/20 text-white ml-6"
                    : "bg-gray-800 text-gray-200 mr-6"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="prose prose-invert prose-sm max-w-none [&_ul]:pl-5 [&_ol]:pl-5 [&_p]:my-1">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  message.content
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Ask CampusClique AI..."
              className="flex-1 bg-gray-900 text-white placeholder-gray-500 text-sm rounded-full px-3 py-2 outline-none border border-gray-700"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSendChat();
                }
              }}
            />
            <button
              type="button"
              onClick={handleSendChat}
              disabled={isSendingChat}
              className="px-4 py-2 rounded-full bg-linear-to-r from-[#1BF0FF] to-[#144DFB] text-black text-sm font-semibold disabled:opacity-60"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 bg-linear-to-r from-[#1BF0FF] to-[#144DFB] text-black font-semibold px-5 py-3 rounded-full shadow-lg hover:opacity-90 transition"
      >
        {isOpen ? "Hide AI" : "Chat with AI"}
      </button>
    </>
  );
};

export default AiChatWidget;
