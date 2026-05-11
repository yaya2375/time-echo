import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './stores/useAuthStore';
import AppShell from './components/layout/AppShell';
import Header from './components/layout/Header';
import TabBar from './components/layout/TabBar';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CreatePage from './pages/CreatePage';
import ChatPage from './pages/ChatPage';
import LibraryPage from './pages/LibraryPage';
import SettingsPage from './pages/SettingsPage';
import Timer from './components/shared/Timer';
import { ROUTES } from './config/routes';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-wechat-green rounded-full animate-pulse-dot" />
            <span className="w-2 h-2 bg-wechat-green rounded-full animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
            <span className="w-2 h-2 bg-wechat-green rounded-full animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function MainLayout() {
  const pathname = useLocation().pathname;
  const showTabBar = [ROUTES.HOME, ROUTES.CHAT, ROUTES.SETTINGS].includes(pathname) || pathname === '/';
  const showHeader = ![ROUTES.CHAT].includes(pathname);

  const titles: Record<string, string> = {
    [ROUTES.HOME]: '时光回响',
    [ROUTES.CREATE]: '创建分身',
    [ROUTES.CHAT]: '',
    [ROUTES.LIBRARY]: '所有分身',
    [ROUTES.SETTINGS]: '我的',
  };

  return (
    <AppShell noPadding>
      <div className="flex flex-col h-full">
        {showHeader && <Header title={titles[pathname] || ''} />}
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.CREATE} element={<CreatePage />} />
            <Route path={ROUTES.CHAT} element={<ChatPage />} />
            <Route path={ROUTES.CHAT + '/:personaId'} element={<ChatPage />} />
            <Route path={ROUTES.CHAT + '/:personaId/:sessionId'} element={<ChatPage />} />
            <Route path={ROUTES.LIBRARY} element={<LibraryPage />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          </Routes>
        </div>
        {showTabBar && <TabBar />}
      </div>
      <Timer />
    </AppShell>
  );
}

export default function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route
        path="*"
        element={
          <AuthGuard>
            <MainLayout />
          </AuthGuard>
        }
      />
    </Routes>
  );
}
