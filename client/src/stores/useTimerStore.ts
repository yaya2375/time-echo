import { create } from 'zustand';
import { getTimerStatus, startTimer, heartbeat, endTimer } from '../services/timerService';

interface TimerState {
  continuousMinutes: number;
  isLimited: boolean;
  cooldownUntil: string | null;
  totalSecondsToday: number;
  limitMinutes: number;
  warningShown: boolean;
  isLoading: boolean;

  init: () => Promise<void>;
  tick: () => Promise<void>;
  stop: () => Promise<void>;
  dismissWarning: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  continuousMinutes: 0,
  isLimited: false,
  cooldownUntil: null,
  totalSecondsToday: 0,
  limitMinutes: 120,
  warningShown: false,
  isLoading: false,

  init: async () => {
    try {
      const status = await getTimerStatus();
      set({
        continuousMinutes: status.continuous_minutes,
        isLimited: status.is_limited,
        cooldownUntil: status.cooldown_until,
        totalSecondsToday: status.total_seconds_today,
        limitMinutes: status.limit_minutes,
      });
      // If not limited, start tracking
      if (!status.is_limited) {
        await startTimer();
      }
    } catch {
      // Timer is non-critical, silently fail
    }
  },

  tick: async () => {
    try {
      const status = await heartbeat(30);
      set({
        continuousMinutes: status.continuous_minutes,
        isLimited: status.is_limited,
        cooldownUntil: status.cooldown_until,
        totalSecondsToday: status.total_seconds_today,
      });
    } catch {
      // Non-critical
    }
  },

  stop: async () => {
    try {
      await endTimer();
    } catch {
      // Non-critical
    }
  },

  dismissWarning: () => set({ warningShown: true }),
}));
