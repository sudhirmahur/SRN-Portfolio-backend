import Admin from '../models/Admin.js';
import Portfolio from '../models/Portfolio.js';
import Profile from '../models/Profile.js';
import Page from '../models/Page.js';
import Project from '../models/Project.js';
import Experience from '../models/Experience.js';
import SkillCategory from '../models/SkillCategory.js';
import Education from '../models/Education.js';
import Certification from '../models/Certification.js';
import Message from '../models/Message.js';
import { env } from '../config/env.js';
import { slugify, RESERVED_SLUGS } from './slugify.js';
import {
  defaultProfile, builtinPages, defaultExperience, defaultSkills,
  defaultProjects, defaultEducation, defaultCertifications,
} from '../data/defaultData.js';

const withOrder = (list, portfolio) => list.map((item, order) => ({ ...item, order, portfolio }));
const SCOPED = [Profile, Page, Project, Experience, SkillCategory, Education, Certification, Message];

/** A free portfolio slug based on `base` (adds -2, -3 ... when taken). */
export async function uniquePortfolioSlug(base) {
  const root = slugify(base) || 'portfolio';
  let slug = root;
  let n = 2;
  const taken = async (value) =>
    RESERVED_SLUGS.includes(value) || Boolean(await Portfolio.exists({ slug: value }));
  while (await taken(slug)) {
    slug = `${root}-${n}`;
    n += 1;
  }
  return slug;
}

export async function insertBuiltinPages(portfolioId) {
  await Page.insertMany(withOrder(builtinPages, portfolioId).map((p) => ({ ...p, type: 'builtin' })));
}

/** Empty starter portfolio for a newly registered user. */
export async function createStarterContent(portfolioId, info) {
  const { name, email, title = '', location = '', phone = '', education = '', job = '', avatar = null } = info;
  const facts = [];
  if (job) facts.push({ icon: 'briefcase', text: job });
  if (education) facts.push({ icon: 'graduation-cap', text: education });
  if (location) facts.push({ icon: 'map-pin', text: location });

  await Profile.create({
    portfolio: portfolioId,
    name,
    role: title,
    email,
    phone,
    location,
    education,
    currentJob: job,
    avatar,
    availability: 'Open to opportunities',
    heroLine1: `Hi, I'm ${name}.`,
    heroHighlight: title || 'Welcome to my portfolio',
    heroLine3: '',
    heroDescription: '',
    terminalLines: [
      { prompt: '$ whoami', output: [name, title].filter(Boolean).join(' — ') },
      { prompt: '$ status', output: 'Open to opportunities' },
    ],
    aboutParagraphs: [],
    aboutStats: [],
    aboutFacts: facts,
    socials: email ? [{ label: 'Email', url: `mailto:${email}`, icon: 'mail' }] : [],
    footerText: title ? `${title} — thanks for visiting my portfolio.` : 'Thanks for visiting my portfolio.',
    footerNote: '',
    siteTitle: [name, title].filter(Boolean).join(' — '),
    siteDescription: `${name}${title ? `, ${title}` : ''} — portfolio.`,
  });
  await insertBuiltinPages(portfolioId);
}

/** Full sample content (the original Sudhir Mahur portfolio) for the super admin's portfolio. */
export async function seedSampleContent(portfolioId, { force = false } = {}) {
  if (force) {
    await Promise.all(
      [Profile, Project, Experience, SkillCategory, Education, Certification].map((M) =>
        M.deleteMany({ portfolio: portfolioId })
      )
    );
    await Page.deleteMany({ portfolio: portfolioId, type: 'builtin' });
  } else if (await Profile.exists({ portfolio: portfolioId })) {
    return false;
  }
  await Profile.create({ ...defaultProfile, portfolio: portfolioId });
  await insertBuiltinPages(portfolioId);
  await Project.insertMany(withOrder(defaultProjects, portfolioId));
  await Experience.insertMany(withOrder(defaultExperience, portfolioId));
  await SkillCategory.insertMany(withOrder(defaultSkills, portfolioId));
  await Education.insertMany(withOrder(defaultEducation, portfolioId));
  await Certification.insertMany(withOrder(defaultCertifications, portfolioId));
  console.log('[bootstrap] Sample portfolio content inserted.');
  return true;
}

/** Make sure every built-in page exists for a portfolio. */
export async function ensureBuiltinPages(portfolioId) {
  const existing = await Page.find({ portfolio: portfolioId, type: 'builtin' }).select('slug');
  const have = new Set(existing.map((p) => p.slug));
  const missing = builtinPages.filter((p) => !have.has(p.slug));
  if (!missing.length) return;
  const count = await Page.countDocuments({ portfolio: portfolioId });
  await Page.insertMany(
    missing.map((page, i) => ({ ...page, type: 'builtin', order: count + i, portfolio: portfolioId }))
  );
}

/** Create the super admin (+ their portfolio) from .env. */
export async function ensureSuperAdmin() {
  let admin = await Admin.findOne({ role: 'superadmin' });

  if (!admin) {
    if ((!env.admin.email || env.admin.password.length < 6) && !(await Admin.exists())) {
      console.warn(
        '[bootstrap] No super admin exists. Set ADMIN_EMAIL and ADMIN_PASSWORD (min 6 chars) in .env and restart.'
      );
      return null;
    }
    // an admin created by the previous single-user version becomes the super admin
    admin =
      (env.admin.email && (await Admin.findOne({ email: env.admin.email }))) ||
      (await Admin.findOne().sort({ createdAt: 1 })); // legacy single-user admin
    if (admin) {
      admin.role = 'superadmin';
      await admin.save();
    } else {
      admin = await Admin.create({
        name: env.admin.name,
        email: env.admin.email,
        password: env.admin.password,
        role: 'superadmin',
      });
      console.log(`[bootstrap] Super admin created: ${env.admin.email}`);
    }
  }

  let portfolio = await Portfolio.findOne({ owner: admin._id });
  if (!portfolio) {
    portfolio = await Portfolio.create({
      owner: admin._id,
      slug: await uniquePortfolioSlug(process.env.ADMIN_SLUG || admin.name),
    });
  }
  return { admin, portfolio };
}

/** Data created by the old single-user version has no portfolio field: attach it. */
async function migrateLegacyData(portfolioId) {
  for (const Model of SCOPED) {
    // eslint-disable-next-line no-await-in-loop
    await Model.updateMany({ portfolio: { $exists: false } }, { $set: { portfolio: portfolioId } });
  }
  try {
    await Page.collection.dropIndex('slug_1'); // old global unique index
  } catch {
    /* index does not exist — fine */
  }
}

export async function bootstrap() {
  const result = await ensureSuperAdmin();
  if (!result) return;
  await migrateLegacyData(result.portfolio._id);
  await Page.syncIndexes();
  await seedSampleContent(result.portfolio._id);
  await ensureBuiltinPages(result.portfolio._id);
}
