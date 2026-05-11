import type { RawMessage, ParseMetadata } from '../types';

const PATTERNS = [
  /^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+(.+)$/,
  /^(\d{4}年\d{1,2}月\d{1,2}日\s+\d{2}:\d{2}:\d{2})\s+(.+)$/,
  /^\[(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\]\s*(.+)$/,
  /^(\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2})\s+(.+?):\s+(.+)$/,
  /^\((\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\)\s*(.+?):\s+(.+)$/,
];

export function detectTxtFormat(content: string): boolean {
  const head = content.slice(0, 2000);
  return PATTERNS.some((p) => p.test(head.split('\n')[0] || ''));
}

export function parseTxt(content: string, fileName?: string): { messages: RawMessage[]; metadata: ParseMetadata } {
  const lines = content.split(/\r?\n/);
  const messages: RawMessage[] = [];

  let patternIndex = -1;
  const head = content.slice(0, 2000);
  for (let i = 0; i < PATTERNS.length; i++) {
    for (const line of lines.slice(0, 20)) {
      if (PATTERNS[i].test(line)) {
        patternIndex = i;
        break;
      }
    }
    if (patternIndex >= 0) break;
  }

  if (patternIndex < 0) {
    return parseWithAllPatterns(lines, fileName);
  }

  const pattern = PATTERNS[patternIndex];

  if (patternIndex >= 3) {
    for (const line of lines) {
      const match = pattern.exec(line);
      if (match) {
        messages.push({
          timestamp: match[1],
          sender: match[2].trim(),
          content: match[3]?.trim() || '',
        });
      }
    }
  } else {
    let current: RawMessage | null = null;
    for (const line of lines) {
      const match = pattern.exec(line);
      if (match) {
        if (current && current.content) messages.push(current);
        current = { timestamp: match[1], sender: match[2].trim(), content: '' };
      } else if (current && line.trim()) {
        if (current.content) current.content += '\n';
        current.content += line;
      }
    }
    if (current && current.content) messages.push(current);
  }

  const senders = [...new Set(messages.map((m) => m.sender))];
  const sender_counts: Record<string, number> = {};
  for (const s of senders) {
    sender_counts[s] = messages.filter((m) => m.sender === s).length;
  }
  const timestamps = messages.map((m) => m.timestamp).filter(Boolean).sort();
  const metadata: ParseMetadata = {
    total_messages: messages.length,
    date_range: {
      earliest: timestamps[0] || '',
      latest: timestamps[timestamps.length - 1] || '',
    },
    senders,
    sender_counts,
    format: fileName?.endsWith('.csv') ? 'csv' : 'txt',
  };

  return { messages, metadata };
}

function parseWithAllPatterns(lines: string[], fileName?: string): { messages: RawMessage[]; metadata: ParseMetadata } {
  const messages: RawMessage[] = [];

  for (const pattern of PATTERNS) {
    const multiLine = !pattern.source.includes(':');

    if (multiLine) {
      let current: RawMessage | null = null;
      for (const line of lines) {
        const match = pattern.exec(line);
        if (match) {
          if (current && current.content) messages.push(current);
          current = { timestamp: match[1], sender: match[2].trim(), content: '' };
        } else if (current && line.trim()) {
          if (current.content) current.content += '\n';
          current.content += line;
        }
      }
      if (current && current.content) messages.push(current);
    } else {
      for (const line of lines) {
        const match = pattern.exec(line);
        if (match) {
          messages.push({
            timestamp: match[1],
            sender: match[2].trim(),
            content: match[3]?.trim() || '',
          });
        }
      }
    }
    if (messages.length > 0) break;
  }

  const senders = [...new Set(messages.map((m) => m.sender))];
  const sender_counts: Record<string, number> = {};
  for (const s of senders) {
    sender_counts[s] = messages.filter((m) => m.sender === s).length;
  }
  const timestamps = messages.map((m) => m.timestamp).filter(Boolean).sort();
  return {
    messages,
    metadata: {
      total_messages: messages.length,
      date_range: { earliest: timestamps[0] || '', latest: timestamps[timestamps.length - 1] || '' },
      senders,
      sender_counts,
      format: fileName?.endsWith('.csv') ? 'csv' : 'txt',
    },
  };
}
