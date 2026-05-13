import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  database_path: process.env.DATABASE_PATH || './data/time-echo.db',
  jwt_secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  encryption_key: process.env.ENCRYPTION_KEY || 'dev-key-change-in-production',
  anthropic_api_key: process.env.ANTHROPIC_API_KEY || '',
  anthropic_model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
  anthropic_max_tokens_persona: parseInt(process.env.ANTHROPIC_MAX_TOKENS_PERSONA || '4096', 10),
  anthropic_max_tokens_chat: parseInt(process.env.ANTHROPIC_MAX_TOKENS_CHAT || '2048', 10),
  usage_limit_minutes: parseInt(process.env.USAGE_LIMIT_MINUTES || '120', 10),
  cooldown_hours: parseInt(process.env.COOLDOWN_HOURS || '8', 10),
  wechat_appid: process.env.WECHAT_APPID || '',
  wechat_secret: process.env.WECHAT_SECRET || '',
};
