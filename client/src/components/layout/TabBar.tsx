import { useNavigate, useLocation } from 'react-router-dom';
import { Home, PlusCircle, MessageCircle, User } from 'lucide-react';
import { ROUTES } from '../../config/routes';

const tabs = [
  { path: ROUTES.HOME, label: '首页', Icon: Home },
  { path: ROUTES.CREATE, label: '创建', Icon: PlusCircle },
  { path: ROUTES.CHAT, label: '对话', Icon: MessageCircle },
  { path: ROUTES.SETTINGS, label: '我的', Icon: User },
];

export default function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className="h-12 flex items-center bg-wechat-card border-t border-wechat-divider shrink-0"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      {tabs.map(({ path, label, Icon }) => (
        <button
          key={path}
          onClick={() => navigate(path)}
          className={`flex-1 flex flex-col items-center justify-center h-full text-xs gap-0.5 ${
            location.pathname === path ? 'text-wechat-green' : 'text-wechat-text-secondary'
          }`}
        >
          <Icon size={20} strokeWidth={location.pathname === path ? 2.5 : 1.5} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
