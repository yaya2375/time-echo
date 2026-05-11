import type { ChatSession } from '@time-echo/shared';
import { MessageCircle, Trash2 } from 'lucide-react';

interface ChatListProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelect: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
}

export default function ChatList({ sessions, currentSessionId, onSelect, onDelete }: ChatListProps) {
  if (sessions.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-wechat-text-secondary">
        暂无对话记录
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {sessions.map((s) => (
        <div
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
            s.id === currentSessionId ? 'bg-green-50' : 'hover:bg-gray-50'
          }`}
        >
          <MessageCircle size={16} className={s.id === currentSessionId ? 'text-wechat-green' : 'text-wechat-text-secondary'} />
          <div className="flex-1 min-w-0">
            <p className={`text-sm truncate ${s.id === currentSessionId ? 'text-wechat-green font-medium' : 'text-wechat-text'}`}>
              {s.title}
            </p>
            {s.last_message_preview && (
              <p className="text-xs text-wechat-text-secondary truncate mt-0.5">{s.last_message_preview}</p>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
            className="text-wechat-text-secondary hover:text-red-500 transition-colors shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
