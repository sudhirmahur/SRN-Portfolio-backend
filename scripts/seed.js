import mongoose from 'mongoose';
import { validateEnv } from '../src/config/env.js';
import { connectDB } from '../src/config/db.js';
import { ensureSuperAdmin, seedSampleContent, ensureBuiltinPages } from '../src/utils/bootstrap.js';

const force = process.argv.includes('--force');

async function run() {
  validateEnv();
  await connectDB();
  const result = await ensureSuperAdmin();
  if (!result) throw new Error('Super admin could not be created. Check ADMIN_EMAIL / ADMIN_PASSWORD in .env');
  const inserted = await seedSampleContent(result.portfolio._id, { force });
  await ensureBuiltinPages(result.portfolio._id);
  console.log(
    inserted
      ? 'Seed complete.'
      : 'Super admin portfolio already has content — nothing changed. Use "npm run seed:force" to reset it to the sample content.'
  );
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
