import mongoose from 'mongoose';

/** Reusable sub-document for any file stored on Cloudinary. */
export const fileSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true, default: '' },
    publicId: { type: String, trim: true, default: '' },
    resourceType: { type: String, enum: ['image', 'raw', 'video'], default: 'image' },
    fileName: { type: String, trim: true, default: '' },
  },
  { _id: false }
);
