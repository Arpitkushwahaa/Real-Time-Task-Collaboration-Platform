export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Board {
  _id: string;
  title: string;
  description?: string;
  owner: User;
  members: User[];
  backgroundColor: string;
  createdAt: string;
  updatedAt: string;
  lists?: List[];
}

export interface List {
  _id: string;
  title: string;
  board: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  list: string;
  board: string;
  position: number;
  assignedTo: User[];
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  _id: string;
  board: string;
  user: User;
  action: string;
  entityType: 'board' | 'list' | 'task';
  entityId: string;
  details: any;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
