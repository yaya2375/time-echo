export interface RawMessage {
  timestamp: string;
  sender: string;
  content: string;
}

export interface ParseResult {
  messages: RawMessage[];
  metadata: ParseMetadata;
}

export interface ParseMetadata {
  total_messages: number;
  date_range: { earliest: string; latest: string };
  senders: string[];
  sender_counts: Record<string, number>;
  format: string;
}

export type ParseStage = 'detecting' | 'parsing' | 'filtering' | 'extracting' | 'done' | 'error';

export interface ParseProgress {
  stage: ParseStage;
  progress: number;
  message?: string;
  error?: string;
}

export interface SelfFilterOptions {
  selfName?: string;
  autoDetect?: boolean;
}
