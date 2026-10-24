import { env, validateEnv } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import { isCloudinaryConfigured } from './src/config/cloudinary.js';
import { bootstrap } from './src/utils/bootstrap.js';
import app from './src/app.js';

async function start() {
  validateEnv();
  await connectDB();
  await bootstrap();

  if (!isCloudinaryConfigured()) {
    console.warn('[cloudinary] Not configured — image/resume uploads are disabled until you add the keys to .env');
  }

  app.listen(env.port, () => {
    console.log(`API running on http://localhost:${env.port}  (${env.nodeEnv})`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
