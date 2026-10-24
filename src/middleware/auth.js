import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import Admin from '../models/Admin.js';
import Portfolio from '../models/Portfolio.js';
import { HttpError, asyncHandler } from '../utils/asyncHandler.js';

export const signToken = (adminId) =>
  jwt.sign({ id: adminId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

/** Requires a valid token; sets req.admin. Blocked accounts are rejected. */
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'Not authenticated. Please log in.');

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new HttpError(401, 'Session expired or invalid. Please log in again.');
  }

  const admin = await Admin.findById(payload.id);
  if (!admin) throw new HttpError(401, 'Account no longer exists.');
  if (admin.blocked) throw new HttpError(403, 'Your account has been blocked. Contact the site owner.');
  req.admin = admin;
  next();
});

/** After protect: loads the admin's own portfolio into req.portfolio. */
export const withPortfolio = asyncHandler(async (req, res, next) => {
  const portfolio = await Portfolio.findOne({ owner: req.admin._id });
  if (!portfolio) throw new HttpError(404, 'Portfolio not found for this account');
  req.portfolio = portfolio;
  next();
});

export const requireSuperAdmin = (req, res, next) => {
  if (req.admin?.role !== 'superadmin') {
    return next(new HttpError(403, 'Only the super admin can do this.'));
  }
  next();
};
