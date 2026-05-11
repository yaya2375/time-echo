import { create } from 'zustand';
import type { Persona, PersonaListItem } from '@time-echo/shared';
import { listPersonas, getPersona, deletePersona as deletePersonaApi } from '../services/personaService';

interface PersonaState {
  personas: PersonaListItem[];
  currentPersona: Persona | null;
  isLoading: boolean;
  error: string | null;

  loadPersonas: () => Promise<void>;
  loadPersona: (id: string) => Promise<void>;
  deletePersona: (id: string) => Promise<void>;
  setCurrentPersona: (persona: Persona | null) => void;
}

export const usePersonaStore = create<PersonaState>((set, get) => ({
  personas: [],
  currentPersona: null,
  isLoading: false,
  error: null,

  loadPersonas: async () => {
    set({ isLoading: true, error: null });
    try {
      const personas = await listPersonas();
      set({ personas, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || '加载失败', isLoading: false });
    }
  },

  loadPersona: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const persona = await getPersona(id);
      set({ currentPersona: persona, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || '加载失败', isLoading: false });
    }
  },

  deletePersona: async (id: string) => {
    try {
      await deletePersonaApi(id);
      set({ personas: get().personas.filter((p) => p.id !== id) });
    } catch (err: any) {
      set({ error: err.response?.data?.error || '删除失败' });
    }
  },

  setCurrentPersona: (persona) => set({ currentPersona: persona }),
}));
