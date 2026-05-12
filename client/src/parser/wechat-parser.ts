import type { RawMessage, ParseResult, ParseProgress, SelfFilterOptions } from './types';
import { detectTxtFormat, parseTxt } from './formats/txt';
import { cleanMessages, normalizeSenders } from './cleaners';
import { detectSelf } from './self-filter';
import type { SelfFilterResult } from './self-filter';

export type ParseHandler = (progress: ParseProgress) => void;

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

function isImageFile(fileName: string): boolean {
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.readAsDataURL(file);
  });
}

export async function parseChatFile(
  file: File,
  selfOpts: SelfFilterOptions = {},
  onProgress?: ParseHandler
): Promise<{ result: ParseResult; selfFilter: SelfFilterResult }> {
  onProgress?.({ stage: 'detecting', progress: 5, message: '正在读取文件...' });

  const fileName = file.name.toLowerCase();

  // Handle image files
  if (isImageFile(fileName)) {
    onProgress?.({ stage: 'parsing', progress: 30, message: '正在读取图片...' });
    const dataUrl = await readFileAsDataURL(file);
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const imageMsg: RawMessage = {
      timestamp: now,
      sender: '我',
      content: '[图片]',
      image: dataUrl,
    };
    const parseResult: ParseResult = {
      messages: [imageMsg],
      metadata: {
        total_messages: 1,
        date_range: { earliest: now, latest: now },
        senders: ['我'],
        sender_counts: { '我': 1 },
        format: fileName.slice(fileName.lastIndexOf('.')),
      },
    };
    const selfFilter = detectSelf([imageMsg], selfOpts.selfName);
    return { result: parseResult, selfFilter };
  }

  const text = await file.text();

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
