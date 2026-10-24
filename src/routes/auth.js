import express from 'express';
import rateLimit from 'express-rate-limit';
import Admin from '../models/Admin.js';
import Portfolio from '../models/Portfolio.js';
import { protect, signToken } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { slugify, RESERVED_SLUGS } from '../utils/slugify.js';
import { createStarterContent, uniquePortfolioSlug } from '../utils/bootstrap.js';
import { env } from '../config/env.js';
import { deleteCloudFile } from '../utils/cloud.js';

const router = express.Router();

const limiter = (limit, windowMinutes, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

const loginLimiter = limiter(30, 15, 'Too many login attempts. Try again in 15 minutes.');
const registerLimiter = limiter(10, 60, 'Too many sign-ups from this network. Try again later.');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (value, max = 200) => String(value ?? '').trim().slice(0, max);

async function describe(admin) {
  const portfolio = await Portfolio.findOne({ owner: admin._id });
  return {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    portfolio: portfolio ? { slug: portfolio.slug, published: portfolio.published } : null,
  };
}

// Is a portfolio URL name free?
router.get(
  '/slug-check',
  asyncHandler(async (req, res) => {
    const slug = slugify(req.query.slug);
    if (slug.length < 3) return res.json({ success: true, available: false, slug, reason: 'Use at least 3 characters' });
    if (RESERVED_SLUGS.includes(slug)) return res.json({ success: true, available: false, slug, reason: 'This name is reserved' });
    const taken = await Portfolio.exists({ slug });
    res.json({ success: true, available: !taken, slug, reason: taken ? 'Already taken' : '' });
  })
);

router.post(
  '/register',
  registerLimiter,
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    const name = text(body.name, 80);
    const email = text(body.email, 200).toLowerCase();
    const password = String(body.password || '');

    // required fields
    if (name.length < 2) throw new HttpError(400, 'Name is required');
    if (!EMAIL_RE.test(email)) throw new HttpError(400, 'A valid email (Gmail) is required');
    if (password.length < 6) throw new HttpError(400, 'Password must be at least 6 characters');
    if (password.length > 100) throw new HttpError(400, 'Password is too long');

    if (await Admin.exists({ email })) throw new HttpError(409, 'An account with this email already exists');

    let slug;
    if (body.slug) {
      slug = slugify(body.slug);
      if (slug.length < 3) throw new HttpError(400, 'Portfolio URL must be at least 3 characters');
      if (RESERVED_SLUGS.includes(slug) || (await Portfolio.exists({ slug }))) {
        throw new HttpError(409, `The portfolio URL "${slug}" is not available. Try another.`);
      }
    } else {
      slug = await uniquePortfolioSlug(name);
    }

    // optional photo uploaded earlier through /api/upload/public-avatar
    let avatar = null;
    const given = body.avatar;
    if (given && typeof given.url === 'string' && typeof given.publicId === 'string') {
      if (given.publicId.startsWith(`${env.cloudinary.folder}/`)) {
        avatar = { url: given.url, publicId: given.publicId, resourceType: 'image', fileName: text(given.fileName, 120) };
      }
    }

    const admin = await Admin.create({ name, email, password, role: 'admin' });
    let portfolio;
    try {
      portfolio = await Portfolio.create({ owner: admin._id, slug });
      await createStarterContent(portfolio._id, {
        name,
        email,
        title: text(body.title, 100),
        location: text(body.location, 100),
        phone: text(body.phone, 30),
        education: text(body.education, 200),
        job: text(body.job, 200),
        avatar,
      });
    } catch (err) {
      // roll back so the person can try again
      await Admin.deleteOne({ _id: admin._id });
      if (portfolio) await Portfolio.deleteOne({ _id: portfolio._id });
      throw err;
    }

    res.status(201).json({ success: true, token: signToken(admin._id), admin: await describe(admin) });
  })
);

router.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const email = text(req.body.email, 200).toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) throw new HttpError(400, 'Email and password are required');

    const admin = await Admin.findOne({ email }).select('+password');
    const ok = admin ? await admin.comparePassword(password) : false;
    if (!ok) throw new HttpError(401, 'Invalid email or password');
    if (admin.blocked) throw new HttpError(403, 'Your account has been blocked. Contact the site owner.');

    admin.lastLoginAt = new Date();
    await admin.save();
    res.json({ success: true, token: signToken(admin._id), admin: await describe(admin) });
  })
);

router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    res.json({ success: true, admin: await describe(req.admin) });
  })
);

router.put(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const { name, email } = req.body;
    if (typeof name === 'string' && name.trim()) req.admin.name = name.trim().slice(0, 80);
    if (typeof email === 'string' && email.trim()) {
      const normalised = email.toLowerCase().trim();
      if (!EMAIL_RE.test(normalised)) throw new HttpError(400, 'Enter a valid email');
      if (await Admin.exists({ email: normalised, _id: { $ne: req.admin._id } })) {
        throw new HttpError(409, 'This email is already used by another account');
      }
      req.admin.email = normalised;
    }
    await req.admin.save();
    res.json({ success: true, admin: await describe(req.admin) });
  })
);

router.put(
  '/password',
  protect,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) throw new HttpError(400, 'Current and new password are required');
    if (String(newPassword).length < 6) throw new HttpError(400, 'New password must be at least 6 characters');

    const admin = await Admin.findById(req.admin._id).select('+password');
    if (!(await admin.comparePassword(String(currentPassword)))) {
      throw new HttpError(401, 'Current password is incorrect');
    }
    admin.password = String(newPassword);
    await admin.save();
    res.json({ success: true, message: 'Password updated', token: signToken(admin._id) });
  })
);

// used when a registration is abandoned after the photo was uploaded
router.post(
  '/discard-avatar',
  registerLimiter,
  asyncHandler(async (req, res) => {
    const publicId = String(req.body.publicId || '');
    if (publicId.startsWith(`${env.cloudinary.folder}/public-avatars/`)) await deleteCloudFile(publicId, 'image');
    res.json({ success: true });
  })
);

export default router;
