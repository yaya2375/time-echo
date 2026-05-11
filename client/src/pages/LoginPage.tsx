import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { ROUTES } from '../config/routes';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(username, password, displayName);
      } else {
        await login(username, password);
      }
      navigate(ROUTES.HOME);
    } catch (err: any) {
      setError(err.response?.data?.error || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-wechat-bg">
      <div className="w-full max-w-sm px-8">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-wechat-text">时光回响</h1>
          <p className="text-sm text-wechat-text-secondary mt-2">与过去的自己，好好聊聊</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full h-11 px-4 rounded-lg border border-wechat-divider bg-white text-base outline-none focus:border-wechat-green transition-colors"
            required
          />

          {isRegister && (
            <input
              type="text"
              placeholder="显示名称（可选）"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full h-11 px-4 rounded-lg border border-wechat-divider bg-white text-base outline-none focus:border-wechat-green transition-colors"
            />
          )}

          <input
            type="password"
            placeholder="密码（至少6位）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 px-4 rounded-lg border border-wechat-divider bg-white text-base outline-none focus:border-wechat-green transition-colors"
            minLength={6}
            required
          />

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-wechat-green text-white text-base font-medium rounded-lg hover:bg-wechat-green-dark disabled:opacity-50 transition-colors"
          >
            {loading ? '请稍候...' : isRegister ? '注册' : '登录'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-wechat-text-secondary">
          {isRegister ? '已有账号？' : '没有账号？'}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-wechat-link ml-1"
          >
            {isRegister ? '去登录' : '去注册'}
          </button>
        </p>
      </div>
    </div>
  );
}
