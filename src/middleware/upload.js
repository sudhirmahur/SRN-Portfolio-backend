import multer from 'multer';
import { HttpError } from '../utils/asyncHandler.js';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'];
const FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    IMAGE_TYPES.includes(file.mimetype)
      ? cb(null, true)
      : cb(new HttpError(400, 'Only JPG, PNG, WEBP, GIF, SVG or AVIF images are allowed.')),
}).single('file');

export const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    FILE_TYPES.includes(file.mimetype)
      ? cb(null, true)
      : cb(new HttpError(400, 'Only PDF, DOC or DOCX files are allowed.')),
}).single('file');
