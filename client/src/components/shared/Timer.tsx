import { Clock, AlertTriangle } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';

export default function Timer() {
  return null; // Temporarily disabled for MVP debugging
  const {
    continuousMinutes,
    remainingMinutes,
    showWarning,
    showCritical,
    showLimit,
    warningShown,
    dismissWarning,
  } = useTimer();

  // Don't show anything until 90 minutes
  if (continuousMinutes < 90 && !showLimit) return null;

  const hours = Math.floor(continuousMinutes / 60);
  const mins = continuousMinutes % 60;

  return (
    <>
      {/* Floating timer */}
      <div
        className={`fixed top-2 right-2 z-50 px-2 py-1 rounded-full text-xs flex items-center gap-1 shadow ${
          showCritical || showLimit
            ? 'bg-red-500 text-white'
            : showWarning
            ? 'bg-amber-500 text-white'
            : 'bg-white/90 text-wechat-text-secondary'
        }`}
      >
        <Clock size={12} />
        {hours > 0 ? `${hours}h` : ''}{mins}m
      </div>

      {/* Warning modal */}
      {showWarning && !warningShown && !showLimit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
          <div className="bg-white rounded-xl p-6 mx-8 max-w-sm text-center shadow-lg">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <p className="text-base font-medium text-wechat-text mb-2">温馨提示</p>
            <p className="text-sm text-wechat-text-secondary mb-1">
              你已连续使用 {hours} 小时 {mins} 分钟
            </p>
            <p className="text-sm text-wechat-text-secondary mb-4">
              建议适当休息，照顾好自己的身心
            </p>
            <button
              onClick={dismissWarning}
              className="w-full h-10 bg-wechat-green text-white rounded-lg text-sm font-medium"
            >
              知道了
            </button>
          </div>
        </div>
      )}

      {/* Critical warning */}
      {showCritical && !showLimit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 mx-8 max-w-sm text-center shadow-lg">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-base font-medium text-wechat-text mb-2">即将达到使用上限</p>
            <p className="text-sm text-wechat-text-secondary mb-1">
              还剩 {remainingMinutes} 分钟
            </p>
            <p className="text-sm text-wechat-text-secondary mb-4">
              到达上限后将需要休息后方可继续使用
            </p>
            <button
              onClick={dismissWarning}
              className="w-full h-10 bg-wechat-green text-white rounded-lg text-sm font-medium"
            >
              我知道了，再聊一会
            </button>
          </div>
        </div>
      )}

      {/* Limit reached overlay */}
      {showLimit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl p-6 mx-8 max-w-sm text-center shadow-lg">
            <div className="text-4xl mb-3">⏰</div>
            <p className="text-base font-medium text-wechat-text mb-2">使用时间已达上限</p>
            <p className="text-sm text-wechat-text-secondary mb-4">
              你已经连续使用了超过推荐时长
              <br />
              请休息一下，照顾好自己的身心
              <br />
              过几小时后再回来
            </p>
            <p className="text-xs text-wechat-text-secondary">
              如果你感到过度依赖或情绪困扰
              <br />
              可以联系心理热线：<span className="text-wechat-link">400-161-9995</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
