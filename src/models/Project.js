import mongoose from 'mongoose';
import { fileSchema } from './fileSchema.js';

const projectSchema = new mongoose.Schema(
  {
    portfolio: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio', required: true, index: true },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    image: { type: fileSchema, default: null },
    tags: { type: [String], default: [] },
    features: { type: [String], default: [] },
    githubUrl: { type: String, trim: true, default: '' },
    liveUrl: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, default: 'Full Stack' },
    featured: { type: Boolean, default: false },
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const PROJECT_FIELDS = [
  'title', 'description', 'image', 'tags', 'features', 'githubUrl', 'liveUrl',
  'category', 'featured', 'visible', 'order',
];

export default mongoose.model('Project', projectSchema);
