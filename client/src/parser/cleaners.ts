import type { RawMessage } from './types';

// Common WeChat system messages to filter out
const SYSTEM_PATTERNS = [
  /^你已添加了.+,现在可以开始聊天了/,
  /^以上是打招呼的内容/,
  /^对方已通过你的好友请求/,
  /^我通过了你的朋友验证请求/,
  /^\[.*\]$/,
  /^<[^>]+>$/,
  /^(图片|视频|语音|文件|位置|红包|转账|链接|小程序|动画表情|聊天记录)$/,
  /^该消息类型暂不支持查看$/,
];

export function isSystemMessage(msg: RawMessage): boolean {
  return SYSTEM_PATTERNS.some((p) => p.test(msg.content.trim()));
}

export function cleanMessages(messages: RawMessage[]): RawMessage[] {
  return messages
    .filter((m) => !isSystemMessage(m))
    .filter((m) => m.content.trim().length > 0)
    .map((m) => ({
      ...m,
      content: m.content.trim(),
    }));
}

// Normalize sender names (some exports have slight variations)
export function normalizeSenders(messages: RawMessage[]): RawMessage[] {
  const senderMap: Record<string, string> = {};

  return messages.map((m) => {
    const trimmed = m.sender.trim();
    if (!senderMap[trimmed]) {
      // Check if very similar to an existing sender
      for (const existing of Object.keys(senderMap)) {
        if (similarNames(trimmed, existing)) {
          senderMap[trimmed] = senderMap[existing];
          break;
        }
      }
      if (!senderMap[trimmed]) {
        senderMap[trimmed] = trimmed;
      }
    }
    return { ...m, sender: senderMap[trimmed] };
  });
}

function similarNames(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  // Handle cases like "张三" vs "张三 " (trailing space)
  if (a.trim() === b.trim()) return true;
  return false;
}
