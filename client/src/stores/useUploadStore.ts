import { create } from 'zustand';
import type { RawMessage, ParseProgress, SelfFilterResult } from '../parser';
import type { FeatureVector } from '@time-echo/shared';

export type UploadStep = 'select-period' | 'upload' | 'preview' | 'identity' | 'generating' | 'done';

export interface UploadedFile {
  name: string;
  messageCount: number;
}

interface UploadState {
  step: UploadStep;
  files: File[];
  uploadedFiles: UploadedFile[];
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
  addFile: (file: File) => void;
  removeFile: (index: number) => void;
  appendMessages: (msgs: RawMessage[], file: UploadedFile) => void;
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
  files: [] as File[],
  uploadedFiles: [] as UploadedFile[],
  messages: [] as RawMessage[],
  selfFilter: null as SelfFilterResult | null,
  featureVector: null as FeatureVector | null,
  progress: null as ParseProgress | null,
  periodStart: '',
  periodEnd: '',
  selfDescription: '',
  selfTags: [] as string[],
  keyEvents: [] as string[],
  whatMattered: '',
  whatChanged: '',
};

export const useUploadStore = create<UploadState>((set) => ({
  ...initial,

  setStep: (step) => set({ step }),
  addFile: (file) => set((s) => ({ files: [...s.files, file] })),
  removeFile: (index) => set((s) => ({
    files: s.files.filter((_, i) => i !== index),
    uploadedFiles: s.uploadedFiles.filter((_, i) => i !== index),
  })),
  appendMessages: (msgs, file) => set((s) => ({
    messages: [...s.messages, ...msgs],
    uploadedFiles: [...s.uploadedFiles, file],
  })),
  setMessages: (messages) => set({ messages }),
  setSelfFilter: (selfFilter) => set({ selfFilter }),
  setFeatureVector: (featureVector) => set({ featureVector }),
  setProgress: (progress) => set({ progress }),
  setPeriod: (periodStart, periodEnd) => set({ periodStart, periodEnd }),
  setSelfDescription: (selfDescription) => set({ selfDescription }),
  setQuestionnaire: (data) => set(data),
  reset: () => set(initial),
}));
