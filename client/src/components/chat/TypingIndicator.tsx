interface TypingIndicatorProps {
  name: string;
}

export default function TypingIndicator({ name }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1 px-3 py-2 bg-white rounded-lg">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse-dot" />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
      </div>
      <span className="text-xs text-wechat-text-secondary">{name}正在输入...</span>
    </div>
  );
}
