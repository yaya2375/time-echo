// Lightweight Chinese text tokenization using Intl.Segmenter (available in modern browsers)
// Falls back to character-level for older browsers

let segmenter: Intl.Segmenter | null = null;

try {
  segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' });
} catch {
  // Fallback: character-level
}

export function tokenize(text: string): string[] {
  if (segmenter) {
    const segments = segmenter.segment(text);
    return [...segments]
      .filter((s) => s.isWordLike)
      .map((s) => s.segment);
  }

  // Fallback: split by character, keeping Chinese chars together
  return text
    .replace(/[^一-鿿\w]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

export function getWordFrequency(tokens: string[]): [string, number][] {
  const freq: Record<string, number> = {};
  for (const token of tokens) {
    if (token.length < 2) continue; // skip single chars
    freq[token] = (freq[token] || 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100);
}
