import { create } from 'zustand';
import { User } from '../types';
import api from '../services/api';
import socket from '../services/socket';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const response = await api.login({ email, password });
      const { user, token } = response.data;

      localStorage.setItem('token', token);
      socket.connect(token);

      set({ user, token, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Login failed',
        loading: false,
      });
      throw error;
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const response = await api.register({ name, email, password });
      const { user, token } = response.data;

      localStorage.setItem('token', token);
      socket.connect(token);

      set({ user, token, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Registration failed',
        loading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    socket.disconnect();
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, token: null });
      return;
    }

    try {
      const response = await api.getMe();
      socket.connect(token);
      set({ user: response.data, token });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, token: null });
    }
  },
}));
