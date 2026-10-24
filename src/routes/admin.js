import express from 'express';
import { protect, withPortfolio } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { createAdminCrud, pick, cleanFiles, assertId } from '../utils/crud.js';
import { deleteRemovedFiles, plain } from '../utils/cloud.js';
import { slugify, RESERVED_SLUGS } from '../utils/slugify.js';

import Portfolio, { PORTFOLIO_FIELDS } from '../models/Portfolio.js';
import Profile, { PROFILE_FIELDS } from '../models/Profile.js';
import Page, { PAGE_BUILTIN_FIELDS, PAGE_CUSTOM_FIELDS } from '../models/Page.js';
import Project, { PROJECT_FIELDS } from '../models/Project.js';
import Experience, { EXPERIENCE_FIELDS } from '../models/Experience.js';
import SkillCategory, { SKILL_FIELDS } from '../models/SkillCategory.js';
import Education, { EDUCATION_FIELDS } from '../models/Education.js';
import Certification, { CERTIFICATION_FIELDS } from '../models/Certification.js';
import Message from '../models/Message.js';

const router = express.Router();
router.use(protect, withPortfolio);

const scope = (req) => ({ portfolio: req.portfolio._id });
const sorted = { order: 1, createdAt: 1 };

/* ------------------------------ dashboard ------------------------------ */
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const q = scope(req);
    const [projects, experience, skillCategories, education, certifications, pages, messages, unread, recent] =
      await Promise.all([
        Project.countDocuments(q),
        Experience.countDocuments(q),
        SkillCategory.countDocuments(q),
        Education.countDocuments(q),
        Certification.countDocuments(q),
        Page.countDocuments(q),
        Message.countDocuments(q),
        Message.countDocuments({ ...q, read: false }),
        Message.find(q).sort({ createdAt: -1 }).limit(5),
      ]);
    res.json({
      success: true,
      data: { projects, experience, skillCategories, education, certifications, pages, messages, unread, recent },
    });
  })
);

/* ---------------------- portfolio: URL, publish, theme ---------------------- */
const HEX = /^#[0-9a-fA-F]{6}$/;

router.get('/portfolio', (req, res) => {
  res.json({ success: true, data: req.portfolio });
});

router.put(
  '/portfolio',
  asyncHandler(async (req, res) => {
    const data = pick(req.body, PORTFOLIO_FIELDS);
    const portfolio = req.portfolio;

    if (data.slug !== undefined) {
      const wanted = slugify(data.slug);
      if (wanted.length < 3) throw new HttpError(400, 'Portfolio URL must be at least 3 characters');
      if (RESERVED_SLUGS.includes(wanted)) throw new HttpError(400, `"${wanted}" is a reserved name`);
      if (await Portfolio.exists({ slug: wanted, _id: { $ne: portfolio._id } })) {
        throw new HttpError(409, `The URL "${wanted}" is already taken`);
      }
      portfolio.slug = wanted;
    }
    if (typeof data.published === 'boolean') portfolio.published = data.published;

    if (data.theme && typeof data.theme === 'object') {
      const theme = pick(data.theme, ['enabled', 'accent', 'bg', 'text', 'headingFont', 'bodyFont']);
      ['accent', 'bg', 'text'].forEach((key) => {
        if (theme[key] !== undefined && !HEX.test(theme[key])) {
          throw new HttpError(400, 'Colors must look like #aabbcc');
        }
      });
      Object.entries(theme).forEach(([key, value]) => portfolio.set(`theme.${key}`, value));
    }

    await portfolio.save();
    res.json({ success: true, data: portfolio });
  })
);

/* ------------------------------- profile ------------------------------- */
async function ownProfile(req) {
  return (await Profile.findOne(scope(req))) || (await Profile.create({ portfolio: req.portfolio._id }));
}

router.get(
  '/profile',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await ownProfile(req) });
  })
);

router.put(
  '/profile',
  asyncHandler(async (req, res) => {
    const profile = await ownProfile(req);
    const before = plain(profile);
    profile.set(cleanFiles(pick(req.body, PROFILE_FIELDS)));
    await profile.save();
    await deleteRemovedFiles(before, plain(profile));
    res.json({ success: true, data: profile });
  })
);

/* -------------------------------- pages -------------------------------- */
async function uniqueSlug(req, base, ignoreId) {
  const root = slugify(base) || 'page';
  let slug = root;
  let counter = 2;
  const taken = async (value) =>
    RESERVED_SLUGS.includes(value) ||
    Boolean(
      await Page.exists(
        ignoreId
          ? { ...scope(req), slug: value, _id: { $ne: ignoreId } }
          : { ...scope(req), slug: value }
      )
    );
  while (await taken(slug)) {
    slug = `${root}-${counter}`;
    counter += 1;
  }
  return slug;
}

const pagesRouter = express.Router();

pagesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await Page.find(scope(req)).sort(sorted) });
  })
);

pagesRouter.put(
  '/reorder',
  asyncHandler(async (req, res) => {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    if (!ids.length) throw new HttpError(400, 'ids must be a non-empty array');
    ids.forEach(assertId);
    await Page.bulkWrite(
      ids.map((id, index) => ({
        updateOne: { filter: { _id: id, ...scope(req) }, update: { $set: { order: index } } },
      }))
    );
    res.json({ success: true, data: await Page.find(scope(req)).sort(sorted) });
  })
);

pagesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = cleanFiles(pick(req.body, PAGE_CUSTOM_FIELDS));
    const label = String(data.label || data.title || '').trim();
    if (!label) throw new HttpError(400, 'Menu label is required');
    data.label = label;
    data.slug = await uniqueSlug(req, data.slug || label);
    data.type = 'custom';
    data.portfolio = req.portfolio._id;
    const last = await Page.findOne(scope(req)).sort({ order: -1 }).select('order');
    data.order = last ? last.order + 1 : 0;
    res.status(201).json({ success: true, data: await Page.create(data) });
  })
);

pagesRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    assertId(req.params.id);
    const page = await Page.findOne({ _id: req.params.id, ...scope(req) });
    if (!page) throw new HttpError(404, 'Page not found');

    const before = plain(page);
    const data = cleanFiles(pick(req.body, page.type === 'builtin' ? PAGE_BUILTIN_FIELDS : PAGE_CUSTOM_FIELDS));

    if (page.slug === 'home') data.visible = true; // the home page can never be hidden
    if (page.type === 'custom' && data.slug !== undefined) {
      const wanted = slugify(data.slug);
      if (!wanted) throw new HttpError(400, 'Slug cannot be empty');
      if (RESERVED_SLUGS.includes(wanted)) throw new HttpError(400, `"${wanted}" is a reserved URL`);
      if (await Page.exists({ ...scope(req), slug: wanted, _id: { $ne: page._id } })) {
        throw new HttpError(409, `Another page already uses the URL "${wanted}"`);
      }
      data.slug = wanted;
    }
    if (data.label !== undefined && !String(data.label).trim()) throw new HttpError(400, 'Menu label is required');

    page.set(data);
    await page.save();
    await deleteRemovedFiles(before, plain(page));
    res.json({ success: true, data: page });
  })
);

pagesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    assertId(req.params.id);
    const page = await Page.findOne({ _id: req.params.id, ...scope(req) });
    if (!page) throw new HttpError(404, 'Page not found');
    if (page.type === 'builtin') {
      throw new HttpError(400, 'Built-in pages cannot be deleted. You can hide them instead.');
    }
    const before = plain(page);
    await page.deleteOne();
    await deleteRemovedFiles(before, {});
    res.json({ success: true, message: 'Page deleted' });
  })
);

router.use('/pages', pagesRouter);

/* --------------------------- generic collections --------------------------- */
router.use('/projects', createAdminCrud(Project, PROJECT_FIELDS));
router.use('/experience', createAdminCrud(Experience, EXPERIENCE_FIELDS));
router.use('/skills', createAdminCrud(SkillCategory, SKILL_FIELDS));
router.use('/education', createAdminCrud(Education, EDUCATION_FIELDS));
router.use('/certifications', createAdminCrud(Certification, CERTIFICATION_FIELDS));

/* -------------------------------- messages -------------------------------- */
router.get(
  '/messages',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await Message.find(scope(req)).sort({ createdAt: -1 }).limit(500) });
  })
);

router.patch(
  '/messages/:id',
  asyncHandler(async (req, res) => {
    assertId(req.params.id);
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, ...scope(req) },
      { read: req.body.read !== false },
      { new: true }
    );
    if (!message) throw new HttpError(404, 'Message not found');
    res.json({ success: true, data: message });
  })
);

router.delete(
  '/messages/:id',
  asyncHandler(async (req, res) => {
    assertId(req.params.id);
    const message = await Message.findOneAndDelete({ _id: req.params.id, ...scope(req) });
    if (!message) throw new HttpError(404, 'Message not found');
    res.json({ success: true, message: 'Message deleted' });
  })
);

export default router;
