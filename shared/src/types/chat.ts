export interface ChatSession {
  id: string;
  user_id: string;
  persona_id: string;
  title: string;
  message_count: number;
  total_tokens: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_message_preview?: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  token_count: number;
  is_correction: boolean;
  correction_of: string | null;
  ai_labeled: boolean;
  created_at: string;
}

export interface CreateSessionInput {
  persona_id: string;
  title?: string;
}

export interface SendMessageInput {
  content: string;
}

export interface SSEEvent {
  type: 'token' | 'done' | 'error' | 'timer_warning';
  content?: string;
  message_id?: string;
  token_count?: number;
  error?: string;
  remaining_minutes?: number;
}

export interface CorrectionInput {
  persona_id: string;
  session_id: string;
  message_id: string;
  original_text: string;
  correction_text: string;
}
