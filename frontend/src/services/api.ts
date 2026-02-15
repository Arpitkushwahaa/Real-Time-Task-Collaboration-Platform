import axios, { AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async register(data: { name: string; email: string; password: string }) {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async login(data: { email: string; password: string }) {
    const response = await this.client.post('/auth/login', data);
    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // Boards
  async getBoards(page = 1, limit = 10) {
    const response = await this.client.get(`/boards?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getBoard(id: string) {
    const response = await this.client.get(`/boards/${id}`);
    return response.data;
  }

  async createBoard(data: { title: string; description?: string; backgroundColor?: string }) {
    const response = await this.client.post('/boards', data);
    return response.data;
  }

  async updateBoard(id: string, data: any) {
    const response = await this.client.put(`/boards/${id}`, data);
    return response.data;
  }

  async deleteBoard(id: string) {
    const response = await this.client.delete(`/boards/${id}`);
    return response.data;
  }

  async addMember(boardId: string, userId: string) {
    const response = await this.client.post(`/boards/${boardId}/members`, { userId });
    return response.data;
  }

  // Lists
  async createList(boardId: string, title: string) {
    const response = await this.client.post(`/boards/${boardId}/lists`, { title });
    return response.data;
  }

  async updateList(id: string, data: any) {
    const response = await this.client.put(`/lists/${id}`, data);
    return response.data;
  }

  async deleteList(id: string) {
    const response = await this.client.delete(`/lists/${id}`);
    return response.data;
  }

  async moveList(id: string, position: number) {
    const response = await this.client.put(`/lists/${id}/move`, { position });
    return response.data;
  }

  // Tasks
  async createTask(listId: string, data: any) {
    const response = await this.client.post(`/boards/${listId}/tasks`, data);
    return response.data;
  }

  async updateTask(id: string, data: any) {
    const response = await this.client.put(`/tasks/${id}`, data);
    return response.data;
  }

  async deleteTask(id: string) {
    const response = await this.client.delete(`/tasks/${id}`);
    return response.data;
  }

  async moveTask(id: string, listId: string, position: number) {
    const response = await this.client.put(`/tasks/${id}/move`, { listId, position });
    return response.data;
  }

  async assignTask(id: string, userId: string) {
    const response = await this.client.post(`/tasks/${id}/assign`, { userId });
    return response.data;
  }

  async searchTasks(boardId: string, query: string) {
    const response = await this.client.get(`/boards/${boardId}/tasks/search?q=${query}`);
    return response.data;
  }

  // Activities
  async getActivities(boardId: string, page = 1, limit = 20) {
    const response = await this.client.get(
      `/boards/${boardId}/activities?page=${page}&limit=${limit}`
    );
    return response.data;
  }
}

export default new ApiClient();
