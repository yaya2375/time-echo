import type { RawMessage } from './types';

export interface SelfFilterResult {
  selfName: string;
  selfMessages: RawMessage[];
  otherSenders: string[];
  confidence: number; // 0-1
}

// Heuristic: the person who talks the most is often "self" in an export context
// But we also consider: the person who uses "我" the most, sends the first message, etc.
export function detectSelf(
  messages: RawMessage[],
  hintName?: string
): SelfFilterResult {
  const senders = [...new Set(messages.map((m) => m.sender))];

  if (senders.length === 1) {
    return {
      selfName: senders[0],
      selfMessages: [...messages],
      otherSenders: [],
      confidence: 1.0,
    };
  }

  const scores: Record<string, number> = {};

  // Self-identifying sender names: these almost always indicate "me"
  const selfNamePatterns = [/^我$/, /^自己$/, /^本人$/, /^Me$/i, /^Self$/i, /^我自己$/];

  for (const sender of senders) {
    let score = 0;
    const msgs = messages.filter((m) => m.sender === sender);

    // 0. Self-identifying name: sender literally named "我" (me) is a dead giveaway
    if (selfNamePatterns.some((p) => p.test(sender))) {
      score += 50;
    }

    // 1. Message count weight (normalized)
    score += (msgs.length / messages.length) * 30;

    // 2. First-person pronoun usage ("我", "我的", "我觉得")
    const text = msgs.map((m) => m.content).join(' ');
    const selfRefs = (text.match(/我/g) || []).length;
    score += Math.min(selfRefs / Math.max(msgs.length, 1) * 20, 20);

    // 3. Message length (self tends to write more — give balanced weight)
    const avgLen = msgs.reduce((s, m) => s + m.content.length, 0) / Math.max(msgs.length, 1);
    score += Math.min(avgLen / 10, 15);

    // 4. Name hint match
    if (hintName && sender.includes(hintName)) {
      score += 25;
    }

    // 5. Initiation rate (self tends to initiate conversations)
    let initiations = 0;
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].sender === sender && messages[i - 1].sender !== sender) {
        initiations++;
      }
    }
    score += Math.min(initiations / Math.max(messages.length, 1) * 100 * 10, 10);

    scores[sender] = score;
  }

  // Find the best match
  let bestSender = senders[0];
  let bestScore = scores[bestSender];

  for (const sender of senders) {
    if (scores[sender] > bestScore) {
      bestScore = scores[sender];
      bestSender = sender;
    }
  }

  const selfMessages = messages.filter((m) => m.sender === bestSender);
  const otherSenders = senders.filter((s) => s !== bestSender);
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalScore > 0 ? bestScore / totalScore : 0.5;

  return {
    selfName: bestSender,
    selfMessages,
    otherSenders,
    confidence: Math.round(confidence * 100) / 100,
  };
}
