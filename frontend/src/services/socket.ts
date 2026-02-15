import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinBoard(boardId: string) {
    this.socket?.emit('join-board', boardId);
  }

  leaveBoard(boardId: string) {
    this.socket?.emit('leave-board', boardId);
  }

  // Board events
  onBoardUpdated(callback: (data: any) => void) {
    this.socket?.on('board-updated', callback);
  }

  emitBoardUpdated(data: any) {
    this.socket?.emit('board-updated', data);
  }

  // List events
  onListCreated(callback: (data: any) => void) {
    this.socket?.on('list-created', callback);
  }

  emitListCreated(data: any) {
    this.socket?.emit('list-created', data);
  }

  onListUpdated(callback: (data: any) => void) {
    this.socket?.on('list-updated', callback);
  }

  emitListUpdated(data: any) {
    this.socket?.emit('list-updated', data);
  }

  onListDeleted(callback: (data: any) => void) {
    this.socket?.on('list-deleted', callback);
  }

  emitListDeleted(data: any) {
    this.socket?.emit('list-deleted', data);
  }

  onListMoved(callback: (data: any) => void) {
    this.socket?.on('list-moved', callback);
  }

  emitListMoved(data: any) {
    this.socket?.emit('list-moved', data);
  }

  // Task events
  onTaskCreated(callback: (data: any) => void) {
    this.socket?.on('task-created', callback);
  }

  emitTaskCreated(data: any) {
    this.socket?.emit('task-created', data);
  }

  onTaskUpdated(callback: (data: any) => void) {
    this.socket?.on('task-updated', callback);
  }

  emitTaskUpdated(data: any) {
    this.socket?.emit('task-updated', data);
  }

  onTaskDeleted(callback: (data: any) => void) {
    this.socket?.on('task-deleted', callback);
  }

  emitTaskDeleted(data: any) {
    this.socket?.emit('task-deleted', data);
  }

  onTaskMoved(callback: (data: any) => void) {
    this.socket?.on('task-moved', callback);
  }

  emitTaskMoved(data: any) {
    this.socket?.emit('task-moved', data);
  }

  onTaskAssigned(callback: (data: any) => void) {
    this.socket?.on('task-assigned', callback);
  }

  emitTaskAssigned(data: any) {
    this.socket?.emit('task-assigned', data);
  }

  removeAllListeners() {
    this.socket?.removeAllListeners();
  }
}

export default new SocketService();
