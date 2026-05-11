import http from './http';
import type { ChatSession, ChatMessage } from '@time-echo/shared';

export async function createSession(personaId: string, title?: string): Promise<ChatSession> {
  const res = await http.post('/chat/sessions', { persona_id: personaId, title });
  return res.data.data;
}

export async function listSessions(personaId?: string): Promise<ChatSession[]> {
  const res = await http.get('/chat/sessions', { params: { persona_id: personaId } });
  return res.data.data;
}

export async function getSession(sessionId: string): Promise<{ session: ChatSession; messages: ChatMessage[] }> {
  const res = await http.get(`/chat/sessions/${sessionId}`);
  return res.data.data;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await http.delete(`/chat/sessions/${sessionId}`);
}

// SSE streaming — returns an AbortController
export function streamMessage(
  sessionId: string,
  content: string,
  onToken: (token: string) => void,
  onDone: (messageId: string) => void,
  onError: (error: string) => void
): AbortController {
  const controller = new AbortController();
  const token = localStorage.getItem('token');

  fetch(`/api/chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        onError(`HTTP ${response.status}`);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        onError('无法读取响应流');
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const event = JSON.parse(data);
              if (event.type === 'token') {
                onToken(event.content);
              } else if (event.type === 'done') {
                onDone(event.message_id);
              } else if (event.type === 'error') {
                onError(event.error);
              }
            } catch {
              // Skip malformed lines
            }
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        onError(err.message || '网络错误');
      }
    });

  return controller;
}
