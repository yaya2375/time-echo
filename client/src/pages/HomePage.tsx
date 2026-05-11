import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { usePersonaStore } from '../stores/usePersonaStore';
import PersonaList from '../components/persona/PersonaList';
import { ROUTES } from '../config/routes';

export default function HomePage() {
  const navigate = useNavigate();
  const { personas, isLoading, loadPersonas, deletePersona } = usePersonaStore();

  useEffect(() => {
    loadPersonas();
  }, [loadPersonas]);

  return (
    <div className="h-full overflow-y-auto p-4">
      {personas.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="text-6xl mb-6">💭</div>
          <h2 className="text-lg font-semibold text-wechat-text mb-3">你还没有创建分身</h2>
          <p className="text-sm text-wechat-text-secondary mb-8 leading-relaxed">
            上传一段聊天记录，创建「过去的自己」
            <br />
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
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-wechat-text-secondary">我的分身</h2>
            <button
              onClick={() => navigate(ROUTES.CREATE)}
              className="text-wechat-green text-sm font-medium flex items-center gap-1"
            >
              <Plus size={16} /> 新建
            </button>
          </div>
          <PersonaList personas={personas} onDelete={deletePersona} loading={isLoading} />
        </>
      )}
    </div>
  );
}
