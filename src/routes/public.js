import express from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
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

const router = express.Router();
const sorted = { order: 1, createdAt: 1 };

/** Public list of published portfolios (landing page). */
router.get(
  '/portfolios',
  asyncHandler(async (req, res) => {
    const blocked = await Admin.find({ blocked: true }).select('_id');
    const portfolios = await Portfolio.find({ published: true, owner: { $nin: blocked.map((a) => a._id) } })
      .sort({ createdAt: -1 })
      .limit(60);
    const profiles = await Profile.find({ portfolio: { $in: portfolios.map((p) => p._id) } }).select(
      'portfolio name role avatar'
    );
    const byPortfolio = new Map(profiles.map((p) => [String(p.portfolio), p]));
    const data = portfolios.map((p) => {
      const profile = byPortfolio.get(String(p._id));
      return {
        slug: p.slug,
        name: profile?.name || p.slug,
        role: profile?.role || '',
        avatar: profile?.avatar?.url || '',
      };
    });
    res.json({ success: true, data });
  })
);

/* ------------------------ everything below: /api/p/:slug ------------------------ */
const site = express.Router({ mergeParams: true });

// resolves the portfolio from the URL; unpublished or blocked portfolios are 404
site.use(
  asyncHandler(async (req, res, next) => {
    const portfolio = await Portfolio.findOne({ slug: String(req.params.slug).toLowerCase() });
    if (!portfolio || !portfolio.published) throw new HttpError(404, 'Portfolio not found');
    const owner = await Admin.findById(portfolio.owner).select('blocked');
    if (!owner || owner.blocked) throw new HttpError(404, 'Portfolio not found');
    req.portfolio = portfolio;
    next();
  })
);

const scope = (req) => ({ portfolio: req.portfolio._id });

site.get(
  '/site',
  asyncHandler(async (req, res) => {
    const [profile, pages] = await Promise.all([
      Profile.findOne(scope(req)),
      Page.find({ ...scope(req), visible: true }).select('-items -body').sort(sorted),
    ]);
    res.json({
      success: true,
      data: {
        profile: profile || {},
        pages,
        theme: req.portfolio.theme,
        template: req.portfolio.template || 'classic',
        portfolio: { slug: req.portfolio.slug },
      },
    });
  })
);

site.get(
  '/pages/:pageSlug',
  asyncHandler(async (req, res) => {
    const page = await Page.findOne({
      ...scope(req),
      slug: String(req.params.pageSlug).toLowerCase(),
      type: 'custom',
      visible: true,
    });
    if (!page) throw new HttpError(404, 'Page not found');
    res.json({ success: true, data: page });
  })
);

site.get(
  '/projects',
  asyncHandler(async (req, res) => {
    const filter = { ...scope(req), visible: true };
    if (req.query.featured === 'true') filter.featured = true;
    res.json({ success: true, data: await Project.find(filter).sort(sorted) });
  })
);

site.get(
  '/experience',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await Experience.find({ ...scope(req), visible: true }).sort(sorted) });
  })
);

site.get(
  '/skills',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await SkillCategory.find({ ...scope(req), visible: true }).sort(sorted) });
  })
);

site.get(
  '/education',
  asyncHandler(async (req, res) => {
    const [education, certifications] = await Promise.all([
      Education.find({ ...scope(req), visible: true }).sort(sorted),
      Certification.find({ ...scope(req), visible: true }).sort(sorted),
    ]);
    res.json({ success: true, data: { education, certifications } });
  })
);

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many messages sent. Please try again later.' },
});

site.post(
  '/contact',
  contactLimiter,
  asyncHandler(async (req, res) => {
    const { name, email, message, website } = req.body || {};
    if (website) return res.status(201).json({ success: true, message: 'Message sent' }); // honeypot

    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanMessage = String(message || '').trim();

    if (!cleanName) throw new HttpError(400, 'Name is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new HttpError(400, 'Enter a valid email address');
    if (cleanMessage.length < 10) throw new HttpError(400, 'Message should be at least 10 characters');
    if (cleanMessage.length > 5000) throw new HttpError(400, 'Message is too long');

    await Message.create({
      portfolio: req.portfolio._id,
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage,
      ip: req.ip,
    });
    res.status(201).json({ success: true, message: 'Message sent' });
  })
);

router.use('/p/:slug', site);

export default router;
