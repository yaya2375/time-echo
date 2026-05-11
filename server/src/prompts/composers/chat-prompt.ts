import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadChatTemplate(): string {
  return readFileSync(join(__dirname, '..', 'templates', 'chat-response.md'), 'utf-8');
}

interface ChatContext {
  personaName: string;
  timePeriod: string;
  timePeriodEnd: string;
  layers: {
    identity: Record<string, unknown>;
    speechStyle: Record<string, unknown>;
    emotional: Record<string, unknown>;
    values: Record<string, unknown> | null;
    knowledgeBoundaries: Record<string, unknown> | null;
    timeAnchor: Record<string, unknown> | null;
  };
  history: Array<{ role: string; content: string }>;
  userMessage: string;
}

export function buildChatMessages(context: ChatContext) {
  let template = loadChatTemplate();

  const identity = context.layers.identity;
  const speech = context.layers.speechStyle;
  const emotional = context.layers.emotional;
  const values = context.layers.values;
  const kb = context.layers.knowledgeBoundaries;
  const anchor = context.layers.timeAnchor;

  // Build summaries
  const identitySummary = [
    `年龄：${(identity as any)?.age_at_time || '未知'}`,
    `职业：${(identity as any)?.occupation || '未知'}`,
    `城市：${(identity as any)?.city || '未知'}`,
    `人生阶段：${(identity as any)?.life_stage || '未知'}`,
    `人格标签：${((identity as any)?.personality_tags || []).join('、')}`,
  ].join('；');

  const speechSummary = [
    `口头禅：${((speech as any)?.catchphrases || []).join('、')}`,
    `标点风格：${(speech as any)?.punctuation_style || '正常'}`,
    `消息格式：${(speech as any)?.message_format || '正常'}`,
    `emoji习惯：${((speech as any)?.emoji_habits || []).join('、')}`,
  ].join('；');

  const emotionalSummary = [
    `常见情绪：${((emotional as any)?.common_emotions || []).join('、')}`,
    `情绪应对：${(emotional as any)?.coping_style || '未知'}`,
    `乐观程度：${(emotional as any)?.optimism_level || '中等'}`,
  ].join('；');

  const valuesSummary = values
    ? `核心信念：${((values as any)?.core_beliefs || []).join('、')}；在乎：${((values as any)?.things_they_cared_about || []).join('、')}`
    : '未提供';

  const knowledgeSummary = kb
    ? [
        `技术边界：${(kb as any)?.technology_boundary || '未知'}`,
        `世界事件边界：${(kb as any)?.world_events_boundary || '未知'}`,
        `个人未来边界：${(kb as any)?.personal_future_boundary || '未知'}`,
        `绝不能知道：${((kb as any)?.must_not_know || []).join('；')}`,
      ].join('\n')
    : '未设置知识边界——请特别注意不要提及时间段之后的事情';

  const timeAnchorSummary = anchor
    ? `时代语境：${(anchor as any)?.era_context || ''}；自我认同：${(anchor as any)?.self_identification || ''}`
    : '未提供';

  // Build conversation history
  const historyStr = context.history.length > 0
    ? context.history
        .slice(-20) // sliding window of 20
        .map((m) => `${m.role === 'user' ? '用户' : '我'}: ${m.content}`)
        .join('\n')
    : '（这是对话的起始）';

  // Replace placeholders
  template = template
    .replace('{{PERSONA_NAME}}', context.personaName)
    .replace('{{TIME_PERIOD}}', context.timePeriod)
    .replace('{{IDENTITY_SUMMARY}}', identitySummary)
    .replace('{{SPEECH_STYLE_SUMMARY}}', speechSummary)
    .replace('{{EMOTIONAL_SUMMARY}}', emotionalSummary)
    .replace('{{VALUES_SUMMARY}}', valuesSummary)
    .replace('{{KNOWLEDGE_BOUNDARIES}}', knowledgeSummary)
    .replace('{{TIME_ANCHOR}}', timeAnchorSummary)
    .replace('{{TIME_PERIOD_END}}', context.timePeriodEnd || '未知')
    .replace('{{TECHNOLOGY_BOUNDARY}}', (kb as any)?.technology_boundary || '未知')
    .replace('{{WORLD_EVENTS_BOUNDARY}}', (kb as any)?.world_events_boundary || '未知')
    .replace('{{PERSONAL_FUTURE_BOUNDARY}}', (kb as any)?.personal_future_boundary || '未知')
    .replace('{{MUST_NOT_KNOW}}', ((kb as any)?.must_not_know || []).join('；') || '无')
    .replace('{{CONVERSATION_HISTORY}}', historyStr)
    .replace('{{USER_MESSAGE}}', context.userMessage);

  return { systemMessage: template };
}
