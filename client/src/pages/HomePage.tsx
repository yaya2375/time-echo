import { useNavigate } from 'react-router-dom';
import { Plus, MessageCircle } from 'lucide-react';
import { ROUTES } from '../config/routes';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-y-auto">
      {/* Empty state */}
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="text-6xl mb-6">💭</div>
        <h2 className="text-lg font-semibold text-wechat-text mb-3">你还没有创建分身</h2>
        <p className="text-sm text-wechat-text-secondary mb-2 leading-relaxed">
          上传一段时间的聊天记录
        </p>
        <p className="text-sm text-wechat-text-secondary mb-2 leading-relaxed">
          创建一个「过去的自己」
        </p>
        <p className="text-sm text-wechat-text-secondary mb-8 leading-relaxed">
          然后和当年的你，好好聊一次天
        </p>

        <button
          onClick={() => navigate(ROUTES.CREATE)}
          className="flex items-center gap-2 px-8 py-3 bg-wechat-green text-white rounded-full text-base font-medium hover:bg-wechat-green-dark transition-colors shadow-sm"
        >
          <Plus size={20} />
          创建第一个分身
        </button>
      </div>
    </div>
  );
}
