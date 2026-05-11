import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadTemplate(name: string): string {
  return readFileSync(join(__dirname, '..', 'templates', name), 'utf-8');
}

export interface PersonaGenerationInput {
  featureVector: Record<string, unknown>;
  timePeriodStart: string;
  timePeriodEnd: string;
  personaType: string;
  selfDescription: string;
  whatMattered: string;
  whatChanged: string;
  keyEvents: string[];
  selfTags: string[];
}

export function buildPersonaGenerationMessages(input: PersonaGenerationInput) {
  const systemBase = loadTemplate('system-base.md');
  let personaTemplate = loadTemplate('persona-generation.md');

  // Replace placeholders
  personaTemplate = personaTemplate
    .replace('{{FEATURE_VECTOR}}', JSON.stringify(input.featureVector, null, 2))
    .replace('{{TIME_PERIOD_START}}', input.timePeriodStart || '未知')
    .replace('{{TIME_PERIOD_END}}', input.timePeriodEnd || '未知')
    .replace('{{PERSONA_TYPE}}', input.personaType)
    .replace('{{SELF_DESCRIPTION}}', input.selfDescription || '未提供')
    .replace('{{WHAT_MATTERED}}', input.whatMattered || '未提供')
    .replace('{{WHAT_CHANGED}}', input.whatChanged || '未提供')
    .replace('{{KEY_EVENTS}}', input.keyEvents?.length ? input.keyEvents.join('、') : '未提供')
    .replace('{{SELF_TAGS}}', input.selfTags?.length ? input.selfTags.join(', ') : '未提供');

  return [
    { role: 'system' as const, content: systemBase },
    { role: 'user' as const, content: personaTemplate },
  ];
}
