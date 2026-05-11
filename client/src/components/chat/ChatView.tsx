import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@time-echo/shared';
import MessageBubble from './MessageBubble';
import TimeAnchor from './TimeAnchor';

interface ChatViewProps {
  messages: ChatMessage[];
  personaName?: string;
  timePeriod?: string;
  loading?: boolean;
  onCorrect?: (msg: ChatMessage) => void;
}

export default function ChatView({ messages, personaName, timePeriod, loading, onCorrect }: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-wechat-green rounded-full animate-pulse-dot" />
          <span className="w-2 h-2 bg-wechat-green rounded-full animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
          <span className="w-2 h-2 bg-wechat-green rounded-full animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-3">💭</div>
          <p className="text-sm text-wechat-text-secondary">
            {personaName ? `和${personaName}说点什么吧` : '选择一个分身开始对话'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto py-2 bg-wechat-bg">
      {timePeriod && personaName && (
        <TimeAnchor name={personaName} timePeriod={timePeriod} />
      )}

      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          onLongPress={msg.role === 'assistant' ? onCorrect : undefined}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
