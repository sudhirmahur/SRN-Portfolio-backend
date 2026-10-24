import express from 'express';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { protect } from '../middleware/auth.js';
import { uploadImage, uploadDocument } from '../middleware/upload.js';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';

const router = express.Router();

const publicLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many uploads. Try again later.' },
});

const FOLDERS = ['projects', 'profile', 'pages', 'misc'];

const ensureConfigured = (req, res, next) => {
  if (!isCloudinaryConfigured()) {
    return next(
      new HttpError(
        503,
        'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in the backend .env file.'
      )
    );
  }
  next();
};

const folderFor = (req) => {
  const requested = String(req.query.folder || 'misc');
  return `${env.cloudinary.folder}/${FOLDERS.includes(requested) ? requested : 'misc'}`;
};

function streamUpload(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(new HttpError(502, `Cloudinary upload failed: ${error.message}`));
      resolve(result);
    });
    stream.end(buffer);
  });
}

// Public: profile photo during registration (no login yet).
router.post(
  '/public-avatar',
  publicLimiter,
  ensureConfigured,
  (req, res, next) => uploadImage(req, res, next),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, 'No image received. Send it as form-data field "file".');
    const result = await streamUpload(req.file.buffer, {
      folder: `${env.cloudinary.folder}/public-avatars`,
      resource_type: 'image',
    });
    res.status(201).json({
      success: true,
      data: { url: result.secure_url, publicId: result.public_id, resourceType: 'image', fileName: req.file.originalname },
    });
  })
);

router.use(protect);

router.post(
  '/image',
  ensureConfigured,
  (req, res, next) => uploadImage(req, res, next),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, 'No image received. Send it as form-data field "file".');
    const result = await streamUpload(req.file.buffer, {
      folder: folderFor(req),
      resource_type: 'image',
    });
    res.status(201).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: 'image',
        fileName: req.file.originalname,
      },
    });
  })
);

router.post(
  '/file',
  ensureConfigured,
  (req, res, next) => uploadDocument(req, res, next),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, 'No file received. Send it as form-data field "file".');
    const ext = path.extname(req.file.originalname).toLowerCase() || '.pdf';
    const base = path
      .basename(req.file.originalname, path.extname(req.file.originalname))
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .slice(0, 40) || 'file';
    // For raw files Cloudinary keeps the extension as part of the public id.
    const result = await streamUpload(req.file.buffer, {
      folder: folderFor(req),
      resource_type: 'raw',
      public_id: `${base}-${Date.now()}${ext}`,
    });
    res.status(201).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: 'raw',
        fileName: req.file.originalname,
      },
    });
  })
);

export default router;
