import { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
  noPadding?: boolean;
}

export default function AppShell({ children, noPadding }: AppShellProps) {
  return (
    <div className="h-full w-full flex justify-center bg-wechat-bg">
      <div className="w-full max-w-phone h-full flex flex-col bg-wechat-bg relative overflow-hidden shadow-lg">
        {noPadding ? children : <div className="flex-1 overflow-y-auto px-4">{children}</div>}
      </div>
    </div>
  );
}
