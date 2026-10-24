import express from 'express';
import { protect, requireSuperAdmin } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { assertId } from '../utils/crud.js';
import { collectFiles, deleteCloudFile, plain } from '../utils/cloud.js';

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
router.use(protect, requireSuperAdmin);

// every admin with their profile details and portfolio URL
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const admins = await Admin.find().sort({ createdAt: -1 });
    const portfolios = await Portfolio.find({ owner: { $in: admins.map((a) => a._id) } });
    const ids = portfolios.map((p) => p._id);
    const [profiles, projectCounts] = await Promise.all([
      Profile.find({ portfolio: { $in: ids } }),
      Project.aggregate([{ $match: { portfolio: { $in: ids } } }, { $group: { _id: '$portfolio', count: { $sum: 1 } } }]),
    ]);
    const portfolioByOwner = new Map(portfolios.map((p) => [String(p.owner), p]));
    const profileByPortfolio = new Map(profiles.map((p) => [String(p.portfolio), p]));
    const counts = new Map(projectCounts.map((c) => [String(c._id), c.count]));

    const data = admins.map((admin) => {
      const portfolio = portfolioByOwner.get(String(admin._id));
      const profile = portfolio ? profileByPortfolio.get(String(portfolio._id)) : null;
      return {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        blocked: admin.blocked,
        createdAt: admin.createdAt,
        lastLoginAt: admin.lastLoginAt || null,
        portfolio: portfolio
          ? { slug: portfolio.slug, published: portfolio.published, projects: counts.get(String(portfolio._id)) || 0 }
          : null,
        profile: profile
          ? {
              title: profile.role,
              phone: profile.phone,
              location: profile.location,
              education: profile.education,
              job: profile.currentJob,
              avatar: profile.avatar?.url || '',
            }
          : null,
      };
    });
    res.json({ success: true, data });
  })
);

router.patch(
  '/users/:id',
  asyncHandler(async (req, res) => {
    assertId(req.params.id);
    const admin = await Admin.findById(req.params.id);
    if (!admin) throw new HttpError(404, 'User not found');
    if (admin.role === 'superadmin') throw new HttpError(400, 'The super admin cannot be blocked');
    if (typeof req.body.blocked === 'boolean') admin.blocked = req.body.blocked;
    await admin.save();
    res.json({ success: true, data: { id: admin._id, blocked: admin.blocked } });
  })
);

router.delete(
  '/users/:id',
  asyncHandler(async (req, res) => {
    assertId(req.params.id);
    const admin = await Admin.findById(req.params.id);
    if (!admin) throw new HttpError(404, 'User not found');
    if (admin.role === 'superadmin') throw new HttpError(400, 'The super admin cannot be deleted');

    const portfolio = await Portfolio.findOne({ owner: admin._id });
    if (portfolio) {
      const q = { portfolio: portfolio._id };
      const docs = await Promise.all([Profile.find(q), Page.find(q), Project.find(q)]);
      const files = collectFiles(docs.flat().map(plain));
      await Promise.all([...files.entries()].map(([id, type]) => deleteCloudFile(id, type)));
      await Promise.all(
        [Profile, Page, Project, Experience, SkillCategory, Education, Certification, Message].map((M) =>
          M.deleteMany(q)
        )
      );
      await portfolio.deleteOne();
    }
    await admin.deleteOne();
    res.json({ success: true, message: 'User and their portfolio were deleted' });
  })
);

export default router;
