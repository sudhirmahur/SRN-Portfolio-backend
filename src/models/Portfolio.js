import mongoose from 'mongoose';
import { FONTS } from '../data/fonts.js';

export const PORTFOLIO_TEMPLATES = [
  'classic', 'brooklyn', 'brandon', 'howard', 'tejas', 'alejandro', 'roton', 'john', 'agency', 'crimson',
  // legacy ids from the previous release (kept so existing documents stay valid; the site shows them as classic)
  'sidebar', 'minimal', 'spotlight', 'bento',
];

const hex = { type: String, match: [/^#[0-9a-fA-F]{6}$/, 'Colors must look like #aabbcc'] };

const portfolioSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    published: { type: Boolean, default: true },
    template: { type: String, enum: PORTFOLIO_TEMPLATES, default: 'classic' },
    theme: {
      enabled: { type: Boolean, default: false },
      accent: { ...hex, default: '#f5b942' },
      bg: { ...hex, default: '#0b1120' },
      text: { ...hex, default: '#e9edf5' },
      headingFont: { type: String, enum: FONTS, default: 'Fraunces' },
      bodyFont: { type: String, enum: FONTS, default: 'Inter' },
    },
  },
  { timestamps: true }
);

export const PORTFOLIO_FIELDS = ['slug', 'published', 'theme', 'template'];

export default mongoose.model('Portfolio', portfolioSchema);
