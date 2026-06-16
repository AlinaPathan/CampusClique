import AiChatSession from "../models/aiChatSession.models.js";
import Post from "../models/post.models.js";

const MAX_HISTORY_MESSAGES = 20;
const OPENROUTER_API_URL =
  process.env.OPENROUTER_API_URL ||
  "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_OPENROUTER_MODEL = "google/gemma-3n-e2b-it:free";
const DEFAULT_OPENROUTER_FALLBACK_MODELS = [
  "deepseek/deepseek-v3.2",
  "google/gemma-3n-e2b-it:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
];
const MAX_CONTEXT_POSTS = 40;
const MAX_CONTEXT_POSTS_COMPACT = 12;

const POSITIVE_KEYWORDS = [
  "love",
  "great",
  "awesome",
  "helpful",
  "useful",
  "thanks",
  "amazing",
  "good",
  "liked",
  "enjoy",
  "best",
];

const mapMessagesForOpenRouter = (messages = []) =>
  messages
    .filter(
      (item) =>
        item?.content && (item.role === "user" || item.role === "model"),
    )
    .map((item) => ({
      role: item.role === "model" ? "assistant" : "user",
      content: item.content,
    }));

const getSessionId = (rawSessionId) => {
  const sessionId = String(rawSessionId || "default").trim();
  return sessionId || "default";
};

const getOrCreateSession = async (userId, sessionId) => {
  let chatSession = await AiChatSession.findOne({ userId, sessionId });

  if (!chatSession) {
    chatSession = await AiChatSession.create({
      userId,
      sessionId,
      messages: [],
    });
  }

  return chatSession;
};

const getConfiguredModels = () => {
  const configured = String(process.env.OPENROUTER_MODEL || "").trim();

  if (!configured) {
    return DEFAULT_OPENROUTER_FALLBACK_MODELS;
  }

  // Supports comma-separated model list in OPENROUTER_MODEL
  const parsedModels = configured
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);

  if (!parsedModels.length) {
    return DEFAULT_OPENROUTER_FALLBACK_MODELS;
  }

  const merged = [...parsedModels];

  for (const fallbackModel of DEFAULT_OPENROUTER_FALLBACK_MODELS) {
    if (!merged.includes(fallbackModel)) {
      merged.push(fallbackModel);
    }
  }

  return merged;
};

const buildAssistantSystemPrompt =
  () => `You are CampusClique AI, the in-app assistant for the CampusClique platform.

Rules:
1. Be concise, friendly, and practical.
2. You must rely on provided CampusClique context for app-specific claims.
3. Never invent users, posts, stats, or events.
4. If evidence is insufficient, say so clearly.
5. If asked "who likes CampusClique" or similar, infer from positive post/comment language and engagement signals from the context. Mention this is an inference, not a direct survey.
6. Keep answers in simple markdown with short paragraphs or bullets.
7. For harmful, abusive, or policy-violating requests, refuse briefly.`;

const getPositiveSignalScore = (text = "") => {
  const lower = String(text).toLowerCase();
  return POSITIVE_KEYWORDS.reduce(
    (score, keyword) => (lower.includes(keyword) ? score + 1 : score),
    0,
  );
};

const buildCampusContext = async ({ maxPosts = MAX_CONTEXT_POSTS } = {}) => {
  const recentPosts = await Post.find({})
    .sort({ createdAt: -1 })
    .limit(maxPosts)
    .populate("user", "fullname role collegeName")
    .select(
      "description hashtags category likes comments reposts user createdAt",
    )
    .lean();

  if (!recentPosts.length) {
    return "No posts are available yet in CampusClique.";
  }

  const hashtagCounts = new Map();
  const userSignals = new Map();
  const postLines = [];

  for (const post of recentPosts) {
    const userId = String(post?.user?._id || post?.user || "unknown");
    const userName = post?.user?.fullname || "Unknown user";
    const likeCount = Array.isArray(post.likes) ? post.likes.length : 0;
    const commentCount = Array.isArray(post.comments)
      ? post.comments.length
      : 0;
    const repostCount = Array.isArray(post.reposts) ? post.reposts.length : 0;
    const description = String(post.description || "").trim();

    const postPositiveScore = getPositiveSignalScore(description);
    let commentPositiveScore = 0;

    for (const comment of post.comments || []) {
      commentPositiveScore += getPositiveSignalScore(comment?.text || "");
    }

    const engagementScore = likeCount + commentCount + repostCount;
    const totalSignal =
      postPositiveScore + commentPositiveScore + engagementScore * 0.1;

    const previousSignal = userSignals.get(userId) || {
      userName,
      collegeName: post?.user?.collegeName || "",
      role: post?.user?.role || "",
      score: 0,
      posts: 0,
    };

    previousSignal.score += totalSignal;
    previousSignal.posts += 1;
    userSignals.set(userId, previousSignal);

    for (const tag of post.hashtags || []) {
      const normalized = String(tag || "")
        .toLowerCase()
        .trim();
      if (!normalized) continue;
      hashtagCounts.set(normalized, (hashtagCounts.get(normalized) || 0) + 1);
    }

    postLines.push(
      `- ${userName}: "${description.slice(0, 120)}" (likes: ${likeCount}, comments: ${commentCount}, reposts: ${repostCount}, category: ${post.category || "general"})`,
    );
  }

  const topHashtags = [...hashtagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag, count]) => `#${tag} (${count})`)
    .join(", ");

  const topPositiveUsers = [...userSignals.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const topPositiveUsersText = topPositiveUsers
    .map(
      (user) =>
        `${user.userName}${user.collegeName ? ` (${user.collegeName})` : ""} - signal ${user.score.toFixed(1)} across ${user.posts} post(s)`,
    )
    .join("\n");

  const contextText = [
    `Recent posts analyzed: ${recentPosts.length}`,
    topHashtags ? `Top hashtags: ${topHashtags}` : "Top hashtags: none",
    "Users with strongest positive/engagement signal:",
    topPositiveUsersText || "None",
    "Recent post samples:",
    ...postLines.slice(0, 12),
  ].join("\n");

  return {
    contextText,
    topPositiveUsers,
    recentPostsCount: recentPosts.length,
  };
};

const callOpenRouter = async ({ apiKey, model, messages }) => {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  if (process.env.OPENROUTER_SITE_URL) {
    headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
  }

  if (process.env.OPENROUTER_SITE_NAME) {
    headers["X-OpenRouter-Title"] = process.env.OPENROUTER_SITE_NAME;
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
      max_tokens: 500,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data?.error?.message || data?.message || "OpenRouter request failed",
    );
    error.status = response.status;
    error.details = data;
    error.model = model;
    throw error;
  }

  const content = data?.choices?.[0]?.message?.content;
  const text = typeof content === "string" ? content.trim() : "";

  if (!text) {
    throw new Error("OpenRouter returned an empty response");
  }

  return text;
};

const isProviderTemporaryError = (error) => {
  const status = Number(error?.status) || 0;
  const errorText = String(error?.message || "").toLowerCase();

  return (
    status >= 500 ||
    status === 400 ||
    errorText.includes("provider returned error") ||
    errorText.includes("timeout") ||
    errorText.includes("temporarily") ||
    errorText.includes("overloaded")
  );
};

const isLikesIntent = (message) => {
  const lower = String(message || "").toLowerCase();
  return (
    lower.includes("who like") ||
    lower.includes("who likes") ||
    lower.includes("who liked") ||
    lower.includes("likes this application") ||
    lower.includes("likes campusclique")
  );
};

const buildLocalLikesFallback = (insights) => {
  const topUsers = insights?.topPositiveUsers || [];

  if (!topUsers.length) {
    return "I could not infer this yet because there is not enough post activity data in CampusClique.";
  }

  const lines = topUsers.slice(0, 5).map((user, index) => {
    const college = user.collegeName ? ` (${user.collegeName})` : "";
    return `${index + 1}. ${user.userName}${college} - positive signal ${user.score.toFixed(1)} from ${user.posts} post(s)`;
  });

  return [
    "Based on recent post language and engagement, users who appear to like CampusClique are:",
    ...lines,
    "",
    "This is an inference from post activity, not a direct survey.",
  ].join("\n");
};

const buildGenericProviderFallback = (message, insights) => {
  const prompt = String(message || "").trim();

  if (!prompt) {
    return "I could not process that message right now. Please try again.";
  }

  // Lightweight local arithmetic fallback for simple prompts like "2+2"
  const isSimpleMath = /^[0-9+\-*/().\s]+$/.test(prompt);
  if (isSimpleMath) {
    try {
      // eslint-disable-next-line no-new-func
      const value = Function(`"use strict"; return (${prompt});`)();
      if (typeof value === "number" && Number.isFinite(value)) {
        return `${prompt} = ${value}`;
      }
    } catch {
      // fall through to generic fallback
    }
  }

  if (isLikesIntent(prompt)) {
    return buildLocalLikesFallback(insights);
  }

  return "The AI provider is temporarily unavailable right now. Please retry in a few seconds.";
};

const tryModels = async ({ apiKey, models, messages }) => {
  let lastError = null;

  for (const model of models) {
    try {
      const text = await callOpenRouter({
        apiKey,
        model,
        messages,
      });

      return { text, usedModel: model };
    } catch (error) {
      lastError = error;

      if (!isProviderTemporaryError(error)) {
        throw error;
      }
    }
  }

  throw lastError;
};

const buildErrorResponse = (error) => {
  const errorText = String(error?.message || "");
  const errorStatus = Number(error?.status) || 0;
  const isQuotaError =
    errorStatus === 429 ||
    errorText.includes("429") ||
    errorText.toLowerCase().includes("quota") ||
    errorText.toLowerCase().includes("rate limit");
  const isAuthError =
    errorStatus === 401 ||
    errorStatus === 403 ||
    errorText.includes("401") ||
    errorText.includes("403") ||
    errorText.toLowerCase().includes("api key not valid") ||
    errorText.toLowerCase().includes("permission denied") ||
    errorText.toLowerCase().includes("unauthorized");
  const isModelError =
    errorStatus === 404 ||
    errorText.includes("404") ||
    errorText.toLowerCase().includes("is not found") ||
    errorText.toLowerCase().includes("model");

  if (isQuotaError) {
    return {
      status: 429,
      body: {
        message: "AI quota exceeded",
        details:
          "OpenRouter quota or free-tier limit reached. Retry later or use a paid model/key.",
      },
    };
  }

  if (isAuthError) {
    return {
      status: 401,
      body: {
        message: "Invalid OpenRouter API key",
        details: "Set a valid OPENROUTER_API_KEY in backend/.env.",
      },
    };
  }

  if (isModelError) {
    return {
      status: 500,
      body: {
        message: "Unsupported OpenRouter model",
        details:
          "Set OPENROUTER_MODEL to a supported model like deepseek/deepseek-v3.2 (or free fallbacks) in backend/.env.",
      },
    };
  }

  return {
    status: 500,
    body: {
      message: "AI service error",
      details: error.message,
    },
  };
};

export const chatWithAi = async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
    const configuredModels = getConfiguredModels();

    if (!apiKey) {
      return res.status(500).json({
        message: "AI service is not configured",
        details:
          "Set OPENROUTER_API_KEY in backend/.env (or reuse GEMINI_API_KEY with your OpenRouter key).",
      });
    }

    const { message, sessionId: incomingSessionId } = req.body || {};

    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const sessionId = getSessionId(incomingSessionId);
    const userId = req.userId;
    const userMessage = String(message).trim();
    const dbSession = await getOrCreateSession(userId, sessionId);
    const previousMessages = dbSession.messages.slice(-MAX_HISTORY_MESSAGES);
    const formattedHistory = mapMessagesForOpenRouter(previousMessages);
    const campusInsights = await buildCampusContext();
    const baseMessages = [
      {
        role: "system",
        content: buildAssistantSystemPrompt(),
      },
      {
        role: "system",
        content: `CampusClique live context:\n${campusInsights.contextText}`,
      },
      ...formattedHistory,
      { role: "user", content: userMessage },
    ];

    let text;
    let usedModel = configuredModels[0] || DEFAULT_OPENROUTER_MODEL;
    try {
      const result = await tryModels({
        apiKey,
        models: configuredModels,
        messages: baseMessages,
      });
      text = result.text;
      usedModel = result.usedModel;
    } catch (error) {
      if (!isProviderTemporaryError(error)) {
        throw error;
      }

      try {
        const compactInsights = await buildCampusContext({
          maxPosts: MAX_CONTEXT_POSTS_COMPACT,
        });
        const compactMessages = [
          {
            role: "system",
            content: buildAssistantSystemPrompt(),
          },
          {
            role: "system",
            content: `CampusClique compact context:\n${compactInsights.contextText}`,
          },
          ...formattedHistory,
          { role: "user", content: userMessage },
        ];

        const retryResult = await tryModels({
          apiKey,
          models: configuredModels,
          messages: compactMessages,
        });
        text = retryResult.text;
        usedModel = retryResult.usedModel;
      } catch (retryError) {
        text = buildGenericProviderFallback(userMessage, campusInsights);
      }
    }

    dbSession.messages.push({ role: "user", content: userMessage });
    dbSession.messages.push({ role: "model", content: text });

    if (dbSession.messages.length > 100) {
      dbSession.messages = dbSession.messages.slice(-100);
    }

    await dbSession.save();

    return res.status(200).json({
      reply: text,
      model: usedModel,
      sessionId,
    });
  } catch (error) {
    console.error("OpenRouter Error:", error);
    const { status, body } = buildErrorResponse(error);
    res.status(status).json(body);
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const sessionId = getSessionId(req.query.sessionId);
    const chatSession = await AiChatSession.findOne({
      userId: req.userId,
      sessionId,
    });

    if (!chatSession) {
      return res.status(200).json({ sessionId, messages: [] });
    }

    const messages = chatSession.messages.map((message) => ({
      role: message.role === "model" ? "assistant" : "user",
      content: message.content,
    }));

    res.status(200).json({ sessionId, messages });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch chat history",
      details: error.message,
    });
  }
};

export const clearChatHistory = async (req, res) => {
  try {
    const sessionId = getSessionId(req.query.sessionId);

    await AiChatSession.findOneAndUpdate(
      { userId: req.userId, sessionId },
      { $set: { messages: [] } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.status(200).json({ message: "Chat history cleared", sessionId });
  } catch (error) {
    res.status(500).json({
      message: "Failed to clear chat history",
      details: error.message,
    });
  }
};

// Keep this for your route compatibility
export const listAiModels = async (req, res) => {
  const configuredModels = getConfiguredModels();

  res.status(200).json({
    message: "Endpoint active",
    provider: "openrouter",
    model: configuredModels[0],
    fallbackModels: configuredModels,
  });
};
