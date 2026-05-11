import { useState, useCallback, useRef } from 'react';
import { streamMessage } from '../services/chatService';

interface UseChatStreamOptions {
  sessionId: string;
}

export function useChatStream({ sessionId }: UseChatStreamOptions) {
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const controllerRef = useRef<AbortController | null>(null);

  const send = useCallback(
    (content: string): Promise<{ messageId: string; fullText: string }> => {
      return new Promise((resolve, reject) => {
        setStreaming(true);
        setStreamingText('');
        let fullText = '';

        controllerRef.current = streamMessage(
          sessionId,
          content,
          (token) => {
            fullText += token;
            setStreamingText(fullText);
          },
          (messageId) => {
            setStreaming(false);
            setStreamingText('');
            resolve({ messageId, fullText });
          },
          (error) => {
            setStreaming(false);
            setStreamingText('');
            reject(new Error(error));
          }
        );
      });
    },
    [sessionId]
  );

  const abort = useCallback(() => {
    controllerRef.current?.abort();
    setStreaming(false);
    setStreamingText('');
  }, []);

  return { send, abort, streaming, streamingText };
}
