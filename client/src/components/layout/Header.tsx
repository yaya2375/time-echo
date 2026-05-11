interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export default function Header({ title, showBack, onBack, rightAction }: HeaderProps) {
  return (
    <div className="h-11 flex items-center justify-center bg-wechat-card border-b border-wechat-divider px-4 relative shrink-0">
      {showBack && (
        <button onClick={onBack} className="absolute left-2 text-wechat-text text-sm px-2 py-1">
          ← 返回
        </button>
      )}
      <h1 className="text-base font-semibold text-wechat-text">{title}</h1>
      {rightAction && <div className="absolute right-2">{rightAction}</div>}
    </div>
  );
}
