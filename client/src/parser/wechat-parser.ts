import type { ParseResult, ParseProgress, SelfFilterOptions } from './types';
import { detectTxtFormat, parseTxt } from './formats/txt';
import { cleanMessages, normalizeSenders } from './cleaners';
import { detectSelf } from './self-filter';
import type { SelfFilterResult } from './self-filter';

export type ParseHandler = (progress: ParseProgress) => void;

export async function parseChatFile(
  file: File,
  selfOpts: SelfFilterOptions = {},
  onProgress?: ParseHandler
): Promise<{ result: ParseResult; selfFilter: SelfFilterResult }> {
  onProgress?.({ stage: 'detecting', progress: 5, message: '正在读取文件...' });

  const text = await file.text();
  const fileName = file.name.toLowerCase();

  onProgress?.({ stage: 'parsing', progress: 20, message: '正在解析聊天记录...' });

  let parseResult: ParseResult;

  if (fileName.endsWith('.csv')) {
    // Treat CSV as txt with comma separator
    parseResult = parseTxt(text, fileName);
  } else if (detectTxtFormat(text)) {
    parseResult = parseTxt(text, fileName);
  } else {
    // Try as plain text with sender detection
    parseResult = parseTxt(text, fileName);
  }

  onProgress?.({ stage: 'filtering', progress: 50, message: '正在清理和筛选...' });

  // Clean and normalize
  const cleaned = cleanMessages(parseResult.messages);
  const normalized = normalizeSenders(cleaned);
  parseResult.messages = normalized;
  parseResult.metadata.total_messages = normalized.length;
  parseResult.metadata.senders = [...new Set(normalized.map((m) => m.sender))];

  onProgress?.({ stage: 'filtering', progress: 70, message: '正在识别你的消息...' });

  // Self-filter
  const selfFilter = detectSelf(normalized, selfOpts.selfName);

  onProgress?.({ stage: 'extracting', progress: 90, message: '正在提取特征向量...' });

  onProgress?.({ stage: 'done', progress: 100, message: '解析完成' });

  return { result: parseResult, selfFilter };
}
