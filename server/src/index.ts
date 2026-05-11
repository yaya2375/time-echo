import { createApp } from './app.js';
import { config } from './config.js';
import { getDb } from './db/index.js';

// Initialize database on startup
const db = await getDb();
console.log('[Time Echo] Database ready');

const app = createApp();

app.listen(config.port, () => {
  console.log(`[Time Echo] Server running at http://localhost:${config.port}`);
  console.log(`[Time Echo] API: http://localhost:${config.port}/api`);
});
