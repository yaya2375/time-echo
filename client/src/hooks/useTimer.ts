import { useEffect, useRef } from 'react';
import { useTimerStore } from '../stores/useTimerStore';

// Heartbeat every 30 seconds
const HEARTBEAT_INTERVAL = 30000;

export function useTimer() {
  const { init, tick, stop, isLimited, continuousMinutes, limitMinutes, warningShown, dismissWarning } = useTimerStore();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    init();

    intervalRef.current = setInterval(() => {
      tick();
    }, HEARTBEAT_INTERVAL);

    return () => {
      clearInterval(intervalRef.current);
      stop();
    };
  }, []);

  const remainingMinutes = limitMinutes - continuousMinutes;
  const showWarning = remainingMinutes <= 15 && remainingMinutes > 0;
  const showCritical = remainingMinutes <= 5 && remainingMinutes > 0;
  const showLimit = isLimited;

  return {
    continuousMinutes,
    remainingMinutes,
    limitMinutes,
    isLimited,
    showWarning,
    showCritical,
    showLimit,
    warningShown,
    dismissWarning,
  };
}
