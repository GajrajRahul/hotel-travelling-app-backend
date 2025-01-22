import { Server } from "socket.io";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      // origin: process.env.FRONTEND_URL,
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", (role) => {
      socket.join("admins");
    });

    socket.on("joinUserRoom", (userId) => {
      socket.join(userId);
    });

    socket.on("disconnect", () => {
    });
  });

  return io;
};

export const getIOInstance = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

export default io;
