import { create } from 'zustand';
import type { RawMessage, ParseProgress, SelfFilterResult } from '../parser';
import type { FeatureVector } from '@time-echo/shared';

export type UploadStep = 'select-period' | 'upload' | 'preview' | 'identity' | 'generating' | 'done';

interface UploadState {
  step: UploadStep;
  file: File | null;
  messages: RawMessage[];
  selfFilter: SelfFilterResult | null;
  featureVector: FeatureVector | null;
  progress: ParseProgress | null;
  // Questionnaire
  periodStart: string;
  periodEnd: string;
  selfDescription: string;
  selfTags: string[];
  keyEvents: string[];
  whatMattered: string;
  whatChanged: string;

  setStep: (step: UploadStep) => void;
  setFile: (file: File | null) => void;
  setMessages: (messages: RawMessage[]) => void;
  setSelfFilter: (sf: SelfFilterResult | null) => void;
  setFeatureVector: (fv: FeatureVector | null) => void;
  setProgress: (progress: ParseProgress | null) => void;
  setPeriod: (start: string, end: string) => void;
  setSelfDescription: (text: string) => void;
  setQuestionnaire: (data: Partial<Pick<UploadState, 'selfTags' | 'keyEvents' | 'whatMattered' | 'whatChanged'>>) => void;
  reset: () => void;
}

const initial = {
  step: 'select-period' as UploadStep,
  file: null,
  messages: [],
  selfFilter: null,
  featureVector: null,
  progress: null,
  periodStart: '',
  periodEnd: '',
  selfDescription: '',
  selfTags: [],
  keyEvents: [],
  whatMattered: '',
  whatChanged: '',
};

export const useUploadStore = create<UploadState>((set) => ({
  ...initial,

  setStep: (step) => set({ step }),
  setFile: (file) => set({ file }),
  setMessages: (messages) => set({ messages }),
  setSelfFilter: (selfFilter) => set({ selfFilter }),
  setFeatureVector: (featureVector) => set({ featureVector }),
  setProgress: (progress) => set({ progress }),
  setPeriod: (periodStart, periodEnd) => set({ periodStart, periodEnd }),
  setSelfDescription: (selfDescription) => set({ selfDescription }),
  setQuestionnaire: (data) => set(data),
  reset: () => set(initial),
}));
