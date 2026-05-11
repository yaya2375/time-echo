// CORE: transforms RawMessage[] → FeatureVector
// This is the privacy boundary — raw messages never leave the browser.
// Only statistical aggregates are transmitted to the server.

import type { RawMessage } from './types';
import type { FeatureVector } from '@time-echo/shared';
import { tokenize, getWordFrequency } from './tokenizer';

// Emoji regex (covers most common emoji)
const EMOJI_RE =
  /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}]/gu;

// Common Chinese sentiment words
const POSITIVE_WORDS = ['开心', '哈哈', '嘿嘿', '棒', '好', '爱', '喜欢', 'nice', '666', '牛', '赞', 'wow', '太棒了', '真好', '不错', 'okk', '好的', '可以', '牛逼', '厉害', '绝了', '给力'];
const NEGATIVE_WORDS = ['烦', '累', '难过', '无语', 'cnm', '傻逼', '操', 'tm', 'tmd', '靠', '哎', '唉', '哭', '气死', '不想', '好累', '崩溃', '怎么办', '好难', '受不了'];
const CONFLICT_WORDS = ['滚', '分', '随便', '算了', '行吧', '呵呵', '哦', '不想说', '没意思', '随便你', '爱咋咋地'];
const ERA_KEYWORDS = ['大学', '高中', '初中', '毕业', '考研', '实习', '工作', '入职', '离职', '搬家', '北京', '上海', '广州', '深圳', '出国', '回国', '分手', '在一起', '结婚', '生日'];

export function extractFeatures(selfMessages: RawMessage[], allMessages: RawMessage[]): FeatureVector {
  const allText = allMessages.map((m) => m.content).join(' ');
  const selfText = selfMessages.map((m) => m.content).join(' ');

  return {
    temporal_patterns: extractTemporal(selfMessages),
    linguistic_features: extractLinguistic(selfText, selfMessages),
    emotional_features: extractEmotional(selfText),
    conversational_features: extractConversational(selfMessages, allMessages),
    time_context: extractTimeContext(selfText),
    metadata: {
      total_messages: allMessages.length,
      self_messages: selfMessages.length,
      date_range: getDateRange(allMessages),
      chat_partners: [...new Set(allMessages.map((m) => m.sender))],
    },
  };
}

function extractTemporal(messages: RawMessage[]) {
  const hourly = new Array(24).fill(0);
  const weekday = new Array(7).fill(0);
  let lateNight = 0;
  let totalWithTime = 0;

  for (const m of messages) {
    try {
      const d = new Date(m.timestamp);
      if (isNaN(d.getTime())) continue;
      totalWithTime++;
      const h = d.getHours();
      hourly[h]++;
      weekday[d.getDay()]++;
      if (h >= 0 && h < 6) lateNight++;
    } catch {
      continue;
    }
  }

  return {
    hourly_distribution: hourly.map((n) => +(n / Math.max(totalWithTime, 1))),
    weekday_distribution: weekday.map((n) => +(n / Math.max(totalWithTime, 1))),
    late_night_percentage: +(lateNight / Math.max(totalWithTime, 1)),
    average_response_delay_minutes: 0, // requires pair analysis
  };
}

function extractLinguistic(text: string, messages: RawMessage[]) {
  const tokens = tokenize(text);
  const avgLen = messages.reduce((s, m) => s + m.content.length, 0) / Math.max(messages.length, 1);
  const emojis = text.match(EMOJI_RE) || [];
  const emojiFreq: Record<string, number> = {};
  for (const e of emojis) {
    emojiFreq[e] = (emojiFreq[e] || 0) + 1;
  }

  // Catchphrase detection: common 4-gram tokens that appear 3+ times
  const ngramFreq: Record<string, number> = {};
  const words = tokenize(text).filter((w) => w.length >= 2);
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = words[i] + words[i + 1];
    if (bigram.length < 4 || bigram.length > 12) continue;
    ngramFreq[bigram] = (ngramFreq[bigram] || 0) + 1;
  }
  const catchphrases = Object.entries(ngramFreq)
    .filter(([, c]) => c >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const totalMsgs = messages.length;
  const questions = messages.filter((m) => m.content.includes('？') || m.content.includes('?')).length;
  const exclamations = messages.filter((m) => m.content.includes('！') || m.content.includes('!')).length;
  const ellipsis = messages.filter((m) => m.content.includes('...') || m.content.includes('…')).length;
  const period = messages.filter((m) => /[。.]/.test(m.content)).length;

  return {
    average_message_length: Math.round(avgLen * 10) / 10,
    top_words: getWordFrequency(tokenize(text)),
    catchphrases,
    sentence_end_marks: {
      period,
      question: questions,
      exclamation: exclamations,
      ellipsis,
      none: totalMsgs - period - questions - exclamations - ellipsis,
    },
    emoji_usage: Object.entries(emojiFreq).sort((a, b) => b[1] - a[1]).slice(0, 50),
    question_ratio: +(questions / Math.max(totalMsgs, 1)),
  };
}

function extractEmotional(text: string) {
  let positive = 0;
  let negative = 0;
  let neutral = 0;

  for (const word of POSITIVE_WORDS) {
    positive += (text.match(new RegExp(word, 'g')) || []).length;
  }
  for (const word of NEGATIVE_WORDS) {
    negative += (text.match(new RegExp(word, 'g')) || []).length;
  }

  const total = positive + negative;
  neutral = Math.max(0, 1000 - total);
  const all = positive + negative + neutral;

  const conflictCount: [string, number][] = [];
  for (const word of CONFLICT_WORDS) {
    const c = (text.match(new RegExp(word, 'g')) || []).length;
    if (c > 0) conflictCount.push([word, c]);
  }

  const selfRefs = (text.match(/我/g) || []).length;
  const totalWords = text.replace(/[\s\n\r]/g, '').length || 1;

  return {
    sentiment_distribution: {
      positive: +(positive / all) || 0,
      negative: +(negative / all) || 0,
      neutral: +(neutral / all) || 0,
    },
    top_emotions: [], // would need a proper emotion classifier
    emotional_volatility: 0,
    conflict_words: conflictCount.sort((a, b) => b[1] - a[1]).slice(0, 10),
    self_reference_ratio: +(selfRefs / totalWords),
  };
}

function extractConversational(selfMessages: RawMessage[], allMessages: RawMessage[]) {
  // Initiation ratio: when a message is from self AND previous message is from someone else
  let initiations = 0;
  for (let i = 1; i < allMessages.length; i++) {
    if (
      allMessages[i].sender === selfMessages[0]?.sender &&
      allMessages[i - 1].sender !== selfMessages[0]?.sender
    ) {
      initiations++;
    }
  }

  const totalTurns = selfMessages.length;

  return {
    initiation_ratio: +(initiations / Math.max(totalTurns, 1)),
    average_turn_length: 0,
    topic_diversity_score: 0,
    use_of_questions: 0,
    conversation_ending_patterns: [],
  };
}

function extractTimeContext(text: string) {
  const eraHits: [string, number][] = [];
  for (const kw of ERA_KEYWORDS) {
    const c = (text.match(new RegExp(kw, 'g')) || []).length;
    if (c > 0) eraHits.push([kw, c]);
  }

  return {
    era_keywords: eraHits.sort((a, b) => b[1] - a[1]).slice(0, 20),
    referenced_events: [],
    referenced_locations: [],
  };
}

function getDateRange(messages: RawMessage[]) {
  const timestamps = messages
    .map((m) => m.timestamp)
    .filter(Boolean)
    .map((t) => new Date(t))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  return {
    earliest: timestamps[0]?.toISOString() || '',
    latest: timestamps[timestamps.length - 1]?.toISOString() || '',
  };
}
