import { create } from 'zustand';
import axios from 'axios';

const api = axios.create({ baseURL: 'https://jira-clone-server.onrender.com/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const useStore = create((set, get) => ({
  tasks: [],
  workspaces: [],
  activeWorkspace: null,
  token: localStorage.getItem('token') || null,

  login: async (email, password) => {
    const res = await api.post('/login', { email, password });
    localStorage.setItem('token', res.data.token);
    set({ token: res.data.token });
  },

  register: async (email, password) => {
    const res = await api.post('/register', { email, password });
    localStorage.setItem('token', res.data.token);
    set({ token: res.data.token });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, tasks: [], workspaces: [], activeWorkspace: null });
  },

  fetchWorkspaces: async () => {
    const res = await api.get('/workspaces');
    set({ workspaces: res.data });
    if (res.data.length > 0 && !get().activeWorkspace) {
      get().setActiveWorkspace(res.data[0]);
    }
  },

  createWorkspace: async (name) => {
    const res = await api.post('/workspaces', { name });
    set((state) => ({ workspaces: [...state.workspaces, res.data] }));
    if (!get().activeWorkspace) {
      get().setActiveWorkspace(res.data);
    }
  },

  setActiveWorkspace: (workspace) => {
    set({ activeWorkspace: workspace });
    get().fetchTasks(workspace._id);
  },

  fetchTasks: async (workspaceId) => {
    if (!workspaceId) return;
    const res = await api.get(`/tasks/${workspaceId}`);
    set({ tasks: res.data });
  },

  addTask: async (taskData) => {
    const res = await api.post('/tasks', taskData);
    set((state) => ({ tasks: [...state.tasks, res.data] }));
  },

  updateTaskStatus: async (taskId, status) => {
    set((state) => ({ tasks: state.tasks.map(t => t._id === taskId ? { ...t, status } : t) }));
    await api.put(`/tasks/${taskId}`, { status });
  },

  updateTaskPriority: async (taskId, priority) => {
    set((state) => ({ tasks: state.tasks.map(t => t._id === taskId ? { ...t, priority } : t) }));
    await api.put(`/tasks/${taskId}`, { priority });
  },

  updateTaskDetails: async (taskId, updates) => {
    set((state) => ({ tasks: state.tasks.map(t => t._id === taskId ? { ...t, ...updates } : t) }));
    await api.put(`/tasks/${taskId}`, updates);
  },

  deleteTask: async (taskId) => {
    set((state) => ({ tasks: state.tasks.filter(t => t._id !== taskId) }));
    await api.delete(`/tasks/${taskId}`);
  }
}));