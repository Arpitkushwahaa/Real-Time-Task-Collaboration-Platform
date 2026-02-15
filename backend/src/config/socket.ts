import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

export const setupSocket = (server: HTTPServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Authentication middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
      };
      socket.data.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.data.userId);

    // Join board room
    socket.on('join-board', (boardId: string) => {
      socket.join(`board:${boardId}`);
      console.log(`User ${socket.data.userId} joined board ${boardId}`);
    });

    // Leave board room
    socket.on('leave-board', (boardId: string) => {
      socket.leave(`board:${boardId}`);
      console.log(`User ${socket.data.userId} left board ${boardId}`);
    });

    // Board events
    socket.on('board-updated', (data) => {
      socket.to(`board:${data.boardId}`).emit('board-updated', data);
    });

    // List events
    socket.on('list-created', (data) => {
      socket.to(`board:${data.boardId}`).emit('list-created', data);
    });

    socket.on('list-updated', (data) => {
      socket.to(`board:${data.boardId}`).emit('list-updated', data);
    });

    socket.on('list-deleted', (data) => {
      socket.to(`board:${data.boardId}`).emit('list-deleted', data);
    });

    socket.on('list-moved', (data) => {
      socket.to(`board:${data.boardId}`).emit('list-moved', data);
    });

    // Task events
    socket.on('task-created', (data) => {
      socket.to(`board:${data.boardId}`).emit('task-created', data);
    });

    socket.on('task-updated', (data) => {
      socket.to(`board:${data.boardId}`).emit('task-updated', data);
    });

    socket.on('task-deleted', (data) => {
      socket.to(`board:${data.boardId}`).emit('task-deleted', data);
    });

    socket.on('task-moved', (data) => {
      socket.to(`board:${data.boardId}`).emit('task-moved', data);
    });

    socket.on('task-assigned', (data) => {
      socket.to(`board:${data.boardId}`).emit('task-assigned', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.data.userId);
    });
  });

  return io;
};
