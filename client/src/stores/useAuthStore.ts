import { create } from 'zustand';
import { login as loginApi, register as registerApi, getMe } from '../services/authService';

interface User {
  id: string;
  username: string;
  display_name: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  isLoading: true,
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (username, password) => {
    const result = await loginApi({ username, password });
    localStorage.setItem('token', result.token);
    set({ token: result.token, user: result.user, isAuthenticated: true });
  },

  register: async (username, password, displayName) => {
    const result = await registerApi({ username, password, display_name: displayName });
    localStorage.setItem('token', result.token);
    set({ token: result.token, user: result.user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const user = await getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('token');
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
