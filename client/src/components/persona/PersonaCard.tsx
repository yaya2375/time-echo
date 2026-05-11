import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import type { PersonaListItem } from '@time-echo/shared';

interface PersonaCardProps {
  persona: PersonaListItem;
  onDelete?: (id: string) => void;
}

const statusLabels: Record<string, string> = {
  draft: '草稿',
  generating: '生成中...',
  ready: '就绪',
  error: '失败',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500',
  generating: 'bg-yellow-100 text-yellow-700',
  ready: 'bg-green-100 text-wechat-green',
  error: 'bg-red-100 text-red-500',
};

export default function PersonaCard({ persona, onDelete }: PersonaCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`${ROUTES.CHAT}/${persona.id}`)}
      className="bg-white rounded-xl border border-gray-100 p-4 active:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-xl text-white shrink-0">
          {persona.type === 'past_self' ? '🧑' : '💞'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-wechat-text truncate">{persona.name}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusColors[persona.status]}`}>
              {statusLabels[persona.status] || persona.status}
            </span>
          </div>
          <p className="text-xs text-wechat-text-secondary mt-0.5">
            {persona.type === 'past_self' ? '以前的自己' : '重要的人'}
            {persona.time_period_start && ` · ${persona.time_period_start}`}
            {persona.time_period_end && ` — ${persona.time_period_end}`}
          </p>
        </div>
        <span className="text-wechat-text-secondary text-xs">v{persona.version}</span>
      </div>

      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(persona.id); }}
          className="mt-2 text-xs text-red-400 hover:text-red-500"
        >
          删除
        </button>
      )}
    </div>
  );
}
