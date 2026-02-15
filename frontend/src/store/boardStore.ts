import { create } from 'zustand';
import { Board, List, Task } from '../types';
import api from '../services/api';

interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  loading: boolean;
  error: string | null;
  fetchBoards: () => Promise<void>;
  fetchBoard: (id: string) => Promise<void>;
  createBoard: (data: { title: string; description?: string; backgroundColor?: string }) => Promise<Board>;
  updateBoard: (id: string, data: any) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  setCurrentBoard: (board: Board | null) => void;
  
  // Real-time updates
  addList: (list: List) => void;
  updateList: (list: List) => void;
  removeList: (listId: string) => void;
  
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  moveTask: (taskId: string, sourceListId: string, destListId: string, position: number) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,

  fetchBoards: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.getBoards();
      set({ boards: response.data, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch boards',
        loading: false,
      });
    }
  },

  fetchBoard: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const response = await api.getBoard(id);
      set({ currentBoard: response.data, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch board',
        loading: false,
      });
    }
  },

  createBoard: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = await api.createBoard(data);
      const newBoard = response.data;
      set((state) => ({
        boards: [newBoard, ...state.boards],
        loading: false,
      }));
      return newBoard;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create board',
        loading: false,
      });
      throw error;
    }
  },

  updateBoard: async (id: string, data: any) => {
    try {
      const response = await api.updateBoard(id, data);
      const updatedBoard = response.data;
      set((state) => ({
        boards: state.boards.map((b) => (b._id === id ? updatedBoard : b)),
        currentBoard: state.currentBoard?._id === id ? updatedBoard : state.currentBoard,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update board',
      });
      throw error;
    }
  },

  deleteBoard: async (id: string) => {
    try {
      await api.deleteBoard(id);
      set((state) => ({
        boards: state.boards.filter((b) => b._id !== id),
        currentBoard: state.currentBoard?._id === id ? null : state.currentBoard,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete board',
      });
      throw error;
    }
  },

  setCurrentBoard: (board: Board | null) => {
    set({ currentBoard: board });
  },

  // Real-time updates
  addList: (list: List) => {
    set((state) => {
      if (!state.currentBoard) return state;
      return {
        currentBoard: {
          ...state.currentBoard,
          lists: [...(state.currentBoard.lists || []), list],
        },
      };
    });
  },

  updateList: (list: List) => {
    set((state) => {
      if (!state.currentBoard) return state;
      return {
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists?.map((l) => (l._id === list._id ? list : l)),
        },
      };
    });
  },

  removeList: (listId: string) => {
    set((state) => {
      if (!state.currentBoard) return state;
      return {
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists?.filter((l) => l._id !== listId),
        },
      };
    });
  },

  addTask: (task: Task) => {
    set((state) => {
      if (!state.currentBoard) return state;
      return {
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists?.map((list) =>
            list._id === task.list
              ? { ...list, tasks: [...(list.tasks || []), task] }
              : list
          ),
        },
      };
    });
  },

  updateTask: (task: Task) => {
    set((state) => {
      if (!state.currentBoard) return state;
      return {
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists?.map((list) =>
            list._id === task.list
              ? {
                  ...list,
                  tasks: list.tasks?.map((t) => (t._id === task._id ? task : t)),
                }
              : list
          ),
        },
      };
    });
  },

  removeTask: (taskId: string) => {
    set((state) => {
      if (!state.currentBoard) return state;
      return {
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists?.map((list) => ({
            ...list,
            tasks: list.tasks?.filter((t) => t._id !== taskId),
          })),
        },
      };
    });
  },

  moveTask: (taskId: string, sourceListId: string, destListId: string, position: number) => {
    set((state) => {
      if (!state.currentBoard) return state;

      let movedTask: Task | undefined;
      const newLists = state.currentBoard.lists?.map((list) => {
        if (list._id === sourceListId) {
          const taskIndex = list.tasks?.findIndex((t) => t._id === taskId);
          if (taskIndex !== undefined && taskIndex !== -1) {
            movedTask = list.tasks![taskIndex];
            return {
              ...list,
              tasks: list.tasks?.filter((t) => t._id !== taskId),
            };
          }
        }
        return list;
      });

      if (movedTask) {
        movedTask = { ...movedTask, list: destListId, position };
        const finalLists = newLists?.map((list) => {
          if (list._id === destListId) {
            const tasks = [...(list.tasks || [])];
            tasks.splice(position, 0, movedTask!);
            return { ...list, tasks };
          }
          return list;
        });

        return {
          currentBoard: {
            ...state.currentBoard,
            lists: finalLists,
          },
        };
      }

      return state;
    });
  },
}));
