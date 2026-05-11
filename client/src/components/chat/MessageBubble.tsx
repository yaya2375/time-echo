import type { ChatMessage } from '@time-echo/shared';

interface MessageBubbleProps {
  message: ChatMessage;
  onLongPress?: (msg: ChatMessage) => void;
}

export default function MessageBubble({ message, onLongPress }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isStreaming = message.id === '__streaming__';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 px-3`}>
      <div className="max-w-[75%]">
        {!isUser && message.ai_labeled && (
          <span className="text-[10px] text-amber-600 ml-1 mb-0.5 block">AI 模拟</span>
        )}
        <div
          onContextMenu={(e) => {
            e.preventDefault();
            if (!isUser && onLongPress) onLongPress(message);
          }}
          className={`relative px-3 py-2 text-sm leading-relaxed break-words ${
            isUser
              ? 'bg-wechat-bubble text-wechat-text rounded-lg'
              : 'bg-white text-wechat-text rounded-lg'
          } ${message.is_correction ? 'border border-amber-300' : ''}`}
        >
          {message.content}
          {isStreaming && (
            <span className="inline-block w-1 h-4 bg-wechat-text animate-pulse-dot ml-0.5 align-middle" />
          )}
        </div>
        {message.is_correction && (
          <p className="text-[10px] text-amber-600 mt-0.5 ml-1">已纠正</p>
        )}
      </div>
    </div>
  );
}
