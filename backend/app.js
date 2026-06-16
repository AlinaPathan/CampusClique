import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./src/routes/auth.routes.js";
import postRoutes from "./src/routes/post.routes.js";
import bookmarkRoutes from "./src/routes/bookmark.routes.js";
import messageRoutes from "./src/routes/message.routes.js";
import communityRoutes from "./src/routes/community.routes.js";
import aiRoutes from "./src/routes/ai.routes.js";
import { connectdb } from "./src/lib/db.js";
import cookieParser from "cookie-parser";

const app = express();
const httpServer = createServer(app);

dotenv.config();
const PORT = process.env.PORT;
const FRONT_ADDRESS = process.env.FRONTADDRESS || "http://localhost:5173";

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: FRONT_ADDRESS,
    credentials: true,
  },
});

// Store active user sockets
const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // User joins
  socket.on("user:join", (userId) => {
    activeUsers.set(userId, socket.id);
    io.emit("user:online", { userId, status: "online" });
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  // Send message
  socket.on("message:send", (data) => {
    const { recipientId, senderId, message, conversationId } = data;
    const recipientSocket = activeUsers.get(recipientId);

    // Send to recipient if online
    if (recipientSocket) {
      io.to(recipientSocket).emit("message:receive", {
        conversationId,
        senderId,
        recipientId,
        message,
        timestamp: new Date(),
      });
    }

    // Acknowledge to sender
    socket.emit("message:sent", { conversationId, timestamp: new Date() });
  });

  // Typing indicator
  socket.on("user:typing", (data) => {
    const { recipientId, senderId } = data;
    const recipientSocket = activeUsers.get(recipientId);
    if (recipientSocket) {
      io.to(recipientSocket).emit("user:typing", { senderId });
    }
  });

  socket.on("user:stoppedTyping", (data) => {
    const { recipientId, senderId } = data;
    const recipientSocket = activeUsers.get(recipientId);
    if (recipientSocket) {
      io.to(recipientSocket).emit("user:stoppedTyping", { senderId });
    }
  });

  // User disconnects
  socket.on("disconnect", () => {
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        io.emit("user:offline", { userId, status: "offline" });
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  cors({
    origin: FRONT_ADDRESS,
    credentials: true,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/ai", aiRoutes);

httpServer.listen(PORT, () => {
  console.log(`Server is listening to ${PORT}`);
  connectdb();
});
