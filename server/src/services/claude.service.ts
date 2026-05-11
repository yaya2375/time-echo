import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: config.anthropic_api_key });
  }
  return client;
}

export interface ClaudeCallOptions {
  maxTokens?: number;
  temperature?: number;
}

export async function callClaude(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string,
  options: ClaudeCallOptions = {}
): Promise<{ content: string; tokens: { input: number; output: number }; costUsd: number }> {
  const c = getClient();
  const model = config.anthropic_model;

  const resp = await c.messages.create({
    model,
    max_tokens: options.maxTokens || config.anthropic_max_tokens_chat,
    temperature: options.temperature ?? 0.7,
    system: systemPrompt,
    messages,
  });

  const inputTokens = resp.usage.input_tokens;
  const outputTokens = resp.usage.output_tokens;

  // Approximate cost calculation (Sonnet pricing)
  const costPer1kInput = 0.003;
  const costPer1kOutput = 0.015;
  const costUsd = (inputTokens / 1000) * costPer1kInput + (outputTokens / 1000) * costPer1kOutput;

  const textBlock = resp.content.find((b) => b.type === 'text');
  const content = textBlock?.text || '';

  return {
    content,
    tokens: { input: inputTokens, output: outputTokens },
    costUsd: Math.round(costUsd * 10000) / 10000,
  };
}

export async function* streamClaude(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string,
  options: ClaudeCallOptions = {}
): AsyncGenerator<{ token: string } | { done: true; tokens: { input: number; output: number }; costUsd: number }> {
  const c = getClient();
  const model = config.anthropic_model;

  const stream = c.messages.stream({
    model,
    max_tokens: options.maxTokens || config.anthropic_max_tokens_chat,
    temperature: options.temperature ?? 0.7,
    system: systemPrompt,
    messages,
  });

  let inputTokens = 0;
  let outputTokens = 0;

  for await (const event of stream) {
    if (event.type === 'message_start') {
      inputTokens = event.message.usage.input_tokens;
    } else if (event.type === 'content_block_delta') {
      const delta = (event as any).delta;
      if (delta?.text) {
        outputTokens++;
        yield { token: delta.text };
      }
    } else if (event.type === 'message_delta') {
      outputTokens = (event as any).usage.output_tokens;
    }
  }

  const costPer1kInput = 0.003;
  const costPer1kOutput = 0.015;
  const costUsd = (inputTokens / 1000) * costPer1kInput + (outputTokens / 1000) * costPer1kOutput;

  yield {
    done: true,
    tokens: { input: inputTokens, output: outputTokens },
    costUsd: Math.round(costUsd * 10000) / 10000,
  };
}
