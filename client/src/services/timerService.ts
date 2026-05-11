import http from './http';
import type { TimerStatusResponse } from '@time-echo/shared';

export async function getTimerStatus(): Promise<TimerStatusResponse> {
  const res = await http.get('/timer/status');
  return res.data.data;
}

export async function startTimer(): Promise<void> {
  await http.post('/timer/start');
}

export async function heartbeat(durationSeconds: number): Promise<TimerStatusResponse> {
  const res = await http.post('/timer/heartbeat', { duration_seconds: durationSeconds });
  return res.data.data;
}

export async function endTimer(): Promise<void> {
  await http.post('/timer/end');
}
