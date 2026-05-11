import { create } from 'zustand';
import type { ChatSession, ChatMessage } from '@time-echo/shared';
import { listSessions, getSession, createSession, deleteSession } from '../services/chatService';

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;

  loadSessions: (personaId?: string) => Promise<void>;
  loadMessages: (sessionId: string) => Promise<void>;
  startNewSession: (personaId: string) => Promise<string>;
  removeSession: (sessionId: string) => Promise<void>;
  addMessage: (msg: ChatMessage) => void;
  prependMessages: (msgs: ChatMessage[]) => void;
  addStreamingMessage: (content: string) => void;
  removeStreamingMessage: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  messages: [],
  isLoading: false,
  error: null,

  loadSessions: async (personaId) => {
    set({ isLoading: true });
    try {
      const sessions = await listSessions(personaId);
      set({ sessions, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  loadMessages: async (sessionId) => {
    set({ isLoading: true, currentSessionId: sessionId });
    try {
      const { messages } = await getSession(sessionId);
      set({ messages, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  startNewSession: async (personaId) => {
    const session = await createSession(personaId);
    set({ currentSessionId: session.id, messages: [] });
    return session.id;
  },

  removeSession: async (sessionId) => {
    await deleteSession(sessionId);
    set({ sessions: get().sessions.filter((s) => s.id !== sessionId) });
  },

  addMessage: (msg) => set({ messages: [...get().messages, msg] }),

  prependMessages: (msgs) => set({ messages: [...msgs, ...get().messages] }),

  addStreamingMessage: (content) => {
    const existing = get().messages.find((m) => m.id === '__streaming__');
    if (existing) {
      set({
        messages: get().messages.map((m) =>
          m.id === '__streaming__' ? { ...m, content } : m
        ),
      });
    } else {
      const streamingMsg: ChatMessage = {
        id: '__streaming__',
        session_id: get().currentSessionId || '',
        role: 'assistant',
        content,
        token_count: 0,
        is_correction: false,
        correction_of: null,
        ai_labeled: true,
        created_at: new Date().toISOString(),
      };
      set({ messages: [...get().messages, streamingMsg] });
    }
  },

  removeStreamingMessage: () => {
    set({ messages: get().messages.filter((m) => m.id !== '__streaming__') });
  },
}));
