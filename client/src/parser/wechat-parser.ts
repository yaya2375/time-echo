import type { RawMessage, ParseResult, ParseProgress, SelfFilterOptions } from './types';
import { detectTxtFormat, parseTxt } from './formats/txt';
import { cleanMessages, normalizeSenders } from './cleaners';
import { detectSelf } from './self-filter';
import type { SelfFilterResult } from './self-filter';
import JSZip from 'jszip';

export type ParseHandler = (progress: ParseProgress) => void;

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const CHAT_EXTENSIONS = ['.txt', '.csv', '.html', '.htm', '.json'];

function isImageFile(fileName: string): boolean {
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

function isChatFile(fileName: string): boolean {
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  return CHAT_EXTENSIONS.includes(ext);
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.readAsDataURL(file);
  });
}

async function parseZipFile(
  file: File,
  onProgress?: ParseHandler
): Promise<{ result: ParseResult; selfFilter: SelfFilterResult; selfOpts: SelfFilterOptions }> {
  onProgress?.({ stage: 'detecting', progress: 10, message: '正在解压文件...' });

  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);

  // Find chat files and image files
  const chatFiles: { name: string; content: string }[] = [];
  const imageMap = new Map<string, string>(); // filename -> data URL

  const entries = Object.entries(zip.files).filter(([_, f]) => !f.dir);

  for (const [name, zipFile] of entries) {
    if (isChatFile(name)) {
      const content = await zipFile.async('text');
      chatFiles.push({ name, content });
    } else if (isImageFile(name)) {
      const blob = await zipFile.async('blob');
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      imageMap.set(name, dataUrl);
    }
  }

  if (chatFiles.length === 0 && imageMap.size > 0) {
    // Only images in zip - treat them as a collection
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const msgs: RawMessage[] = [];
    for (const [name, dataUrl] of imageMap) {
      msgs.push({ timestamp: now, sender: '我', content: `[图片: ${name}]`, image: dataUrl });
    }
    const parseResult: ParseResult = {
      messages: msgs,
      metadata: {
        total_messages: msgs.length,
        date_range: { earliest: now, latest: now },
        senders: ['我'],
        sender_counts: { '我': msgs.length },
        format: 'zip-images',
      },
    };
    const selfFilter = detectSelf(msgs, undefined);
    return { result: parseResult, selfFilter, selfOpts: {} };
  }

  if (chatFiles.length === 0) {
    throw new Error('压缩包内没有找到聊天记录文件，请检查是否包含 .txt / .csv / .html 文件');
  }

  // Pick the largest chat file as the main one
  chatFiles.sort((a, b) => b.content.length - a.content.length);
  const mainFile = chatFiles[0];

  onProgress?.({ stage: 'parsing', progress: 30, message: `正在解析 ${mainFile.name}...` });

  const parseResult = parseTxt(mainFile.content, mainFile.name);

  // Replace image references in messages with data URLs from the zip
  if (imageMap.size > 0) {
    for (const msg of parseResult.messages) {
      if (msg.image && !msg.image.startsWith('data:')) {
        const matchedKey = imageMap.get(msg.image) || imageMap.get(msg.image.split('/').pop() || '');
        if (matchedKey) {
          msg.image = matchedKey;
        }
      }
      // Also check content for image filenames
      const imgMatch = msg.content.match(/\[图片[：:]\s*([^\]]+)\]/);
      if (imgMatch) {
        const imgName = imgMatch[1].trim();
        const dataUrl = imageMap.get(imgName) || [...imageMap.entries()].find(([k]) => k.includes(imgName))?.[1];
        if (dataUrl) {
          msg.image = dataUrl;
          msg.content = msg.content.replace(imgMatch[0], '[图片]');
        }
      }
    }
  }

  const cleaned = cleanMessages(parseResult.messages);
  const normalized = normalizeSenders(cleaned);
  parseResult.messages = normalized;
  parseResult.metadata.total_messages = normalized.length;
  parseResult.metadata.senders = [...new Set(normalized.map((m) => m.sender))];

  onProgress?.({ stage: 'filtering', progress: 70, message: '正在识别你的消息...' });

  const selfFilter = detectSelf(normalized, undefined);
  return { result: parseResult, selfFilter, selfOpts: {} };
}

export async function parseChatFile(
  file: File,
  selfOpts: SelfFilterOptions = {},
  onProgress?: ParseHandler
): Promise<{ result: ParseResult; selfFilter: SelfFilterResult }> {
  onProgress?.({ stage: 'detecting', progress: 5, message: '正在读取文件...' });

  const fileName = file.name.toLowerCase();

  // Handle zip files
  if (fileName.endsWith('.zip')) {
    return parseZipFile(file, onProgress);
  }

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
