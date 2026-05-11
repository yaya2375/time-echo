// FeatureVector: the privacy boundary
// Raw chat messages never leave the browser.
// Only statistical aggregates are transmitted to the server.

export interface FeatureVector {
  temporal_patterns: TemporalPatterns;
  linguistic_features: LinguisticFeatures;
  emotional_features: EmotionalFeatures;
  conversational_features: ConversationalFeatures;
  time_context: TimeContext;
  metadata: FeatureMetadata;
}

export interface TemporalPatterns {
  hourly_distribution: number[];       // 24 slots
  weekday_distribution: number[];      // 7 slots
  late_night_percentage: number;
  average_response_delay_minutes: number;
}

export interface LinguisticFeatures {
  average_message_length: number;
  top_words: [string, number][];       // Top 100
  catchphrases: [string, number][];    // Top 20
  sentence_end_marks: {
    period: number;
    question: number;
    exclamation: number;
    ellipsis: number;
    none: number;
  };
  emoji_usage: [string, number][];     // Top 50
  question_ratio: number;
}

export interface EmotionalFeatures {
  sentiment_distribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  top_emotions: [string, number][];
  emotional_volatility: number;
  conflict_words: [string, number][];
  self_reference_ratio: number;
}

export interface ConversationalFeatures {
  initiation_ratio: number;
  average_turn_length: number;
  topic_diversity_score: number;
  use_of_questions: number;
  conversation_ending_patterns: string[];
}

export interface TimeContext {
  era_keywords: [string, number][];
  referenced_events: string[];
  referenced_locations: string[];
}

export interface FeatureMetadata {
  total_messages: number;
  self_messages: number;
  date_range: { earliest: string; latest: string };
  chat_partners: string[];
}

// Raw parsed message (never leaves the browser)
export interface RawMessage {
  timestamp: string;
  sender: string;
  content: string;
}

export interface ParseResult {
  messages: RawMessage[];
  metadata: {
    total_messages: number;
    date_range: { earliest: string; latest: string };
    senders: string[];
    format: string;
  };
}

export interface ParseProgress {
  stage: 'detecting' | 'parsing' | 'filtering' | 'extracting' | 'done' | 'error';
  progress: number; // 0-100
  message?: string;
  error?: string;
}
