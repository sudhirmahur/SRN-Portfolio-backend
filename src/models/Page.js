import mongoose from 'mongoose';
import { fileSchema } from './fileSchema.js';

const { Schema } = mongoose;

const itemSchema = new Schema({
  title: { type: String, trim: true, default: '' },
  subtitle: { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },
  image: { type: fileSchema, default: null },
  link: { type: String, trim: true, default: '' },
  linkLabel: { type: String, trim: true, default: '' },
  tags: { type: [String], default: [] },
});

const pageSchema = new Schema(
  {
    portfolio: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio', required: true, index: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    type: { type: String, enum: ['builtin', 'custom'], default: 'custom' },
    label: { type: String, required: true, trim: true }, // text shown in header/footer
    visible: { type: Boolean, default: true },
    showInNav: { type: Boolean, default: true },
    showInFooter: { type: Boolean, default: true },
    order: { type: Number, default: 0 },

    // section heading
    kicker: { type: String, trim: true, default: '' },
    title: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },

    // custom page content
    body: { type: String, default: '' },
    layout: { type: String, enum: ['text', 'cards', 'gallery', 'list'], default: 'cards' },
    items: { type: [itemSchema], default: [] },
  },
  { timestamps: true }
);

pageSchema.index({ portfolio: 1, slug: 1 }, { unique: true });

export const PAGE_BUILTIN_FIELDS = ['label', 'visible', 'showInNav', 'showInFooter', 'kicker', 'title', 'description'];
export const PAGE_CUSTOM_FIELDS = [...PAGE_BUILTIN_FIELDS, 'slug', 'body', 'layout', 'items'];

export default mongoose.model('Page', pageSchema);
