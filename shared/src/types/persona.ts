// 8-layer Persona structure for "时光回响"
// Layers 0-4: standard (from ex-skill)
// Layers 5-7: extended (for "past self" mode)

export type PersonaType = 'past_self' | 'other_person';
export type PersonaStatus = 'draft' | 'generating' | 'ready' | 'error';

export interface Layer0HardRules {
  constraints: string[];
  boundaries: string[];
  safety_rules: string[];
  correction_log: CorrectionEntry[];
}

export interface CorrectionEntry {
  timestamp: string;
  original: string;
  corrected: string;
  reason: string;
}

export interface Layer1Identity {
  age_at_time: string;
  occupation: string;
  city: string;
  life_stage: string;
  mbti: string;
  zodiac: string;
  attachment_style: string;
  love_language: string;
  personality_tags: string[];
}

export interface Layer2SpeechStyle {
  catchphrases: string[];
  sentence_patterns: string[];
  emoji_habits: string[];
  punctuation_style: string;
  message_format: string;
  typing_quirks: string[];
  code_switching: string[];
}

export interface Layer3EmotionalPatterns {
  emotional_range: string[];
  common_emotions: string[];
  triggers: string[];
  coping_style: string;
  optimism_level: string;
}

export interface Layer4RelationshipBehavior {
  conflict_style: string;
  affection_expression: string;
  daily_interaction_pattern: string;
  boundaries: string[];
}

export interface Layer5Values {
  core_beliefs: string[];
  moral_stances: string[];
  life_principles: string[];
  things_they_cared_about: string[];
  things_they_rejected: string[];
}

export interface Layer6KnowledgeBoundaries {
  known_at_time: string[];
  must_not_know: string[];
  technology_boundary: string;
  world_events_boundary: string;
  personal_future_boundary: string;
}

export interface Layer7TimeAnchor {
  era_context: string;
  key_life_events: string[];
  cultural_context: string;
  self_identification: string;
  temporal_markers: string[];
}

export interface Persona {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  type: PersonaType;
  status: PersonaStatus;
  time_period_start: string;
  time_period_end: string;
  // 8 layers
  layer_0_hard_rules: Layer0HardRules;
  layer_1_identity: Layer1Identity;
  layer_2_speech_style: Layer2SpeechStyle;
  layer_3_emotional_patterns: Layer3EmotionalPatterns;
  layer_4_relationship_behavior: Layer4RelationshipBehavior;
  layer_5_values: Layer5Values | null;
  layer_6_knowledge_boundaries: Layer6KnowledgeBoundaries | null;
  layer_7_time_anchor: Layer7TimeAnchor | null;
  // Feature vector used to generate this persona
  feature_vector: Record<string, unknown> | null;
  // Versioning
  version: number;
  parent_version_id: string | null;
  has_corrections: boolean;
  correction_count: number;
  // Cost tracking
  generation_prompt_tokens: number;
  generation_cost_usd: number;
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface PersonaListItem {
  id: string;
  name: string;
  slug: string;
  type: PersonaType;
  status: PersonaStatus;
  time_period_start: string;
  time_period_end: string;
  version: number;
  created_at: string;
}

export interface CreatePersonaInput {
  name: string;
  type: PersonaType;
  time_period_start: string;
  time_period_end: string;
}

export interface GeneratePersonaInput {
  feature_vector: Record<string, unknown>;
  questionnaire: {
    self_description: string;
    self_tags: string[];
    key_events: string[];
    what_mattered: string;
    what_changed: string;
  };
}

export interface UpdatePersonaLayerInput {
  layer: string;
  content: Record<string, unknown>;
}

export interface PersonaVersion {
  version: number;
  persona_id: string;
  created_at: string;
  snapshot: Persona;
}
