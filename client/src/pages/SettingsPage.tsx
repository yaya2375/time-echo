import { useAuthStore } from '../stores/useAuthStore';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();

  return (
    <div className="h-full overflow-y-auto">
      {/* User card */}
      <div className="bg-white mx-4 mt-4 rounded-lg overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-6">
          <div className="w-14 h-14 rounded-full bg-wechat-green text-white flex items-center justify-center text-xl font-semibold">
            {user?.display_name?.[0] || '?'}
          </div>
          <div>
            <p className="text-base font-medium text-wechat-text">{user?.display_name}</p>
            <p className="text-sm text-wechat-text-secondary">@{user?.username}</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="bg-white mx-4 mt-4 rounded-lg overflow-hidden">
        <button className="w-full text-left px-4 py-3 border-b border-wechat-divider text-wechat-text text-sm">
          数据导出
        </button>
        <button className="w-full text-left px-4 py-3 border-b border-wechat-divider text-wechat-text text-sm">
          隐私设置
        </button>
        <button className="w-full text-left px-4 py-3 text-wechat-text text-sm">
          关于时光回响
        </button>
      </div>

      {/* Logout */}
      <div className="mx-4 mt-8">
        <button
          onClick={logout}
          className="w-full h-11 bg-white rounded-lg text-red-500 text-sm font-medium"
        >
          退出登录
        </button>
      </div>
    </div>
  );
}
