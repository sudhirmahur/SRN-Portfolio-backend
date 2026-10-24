import mongoose from 'mongoose';
import { fileSchema } from './fileSchema.js';

const { Schema } = mongoose;

const profileSchema = new Schema(
  {
    portfolio: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio', required: true, index: true },
    // identity / contact
    name: { type: String, trim: true, default: '' },
    role: { type: String, trim: true, default: '' },
    availability: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    education: { type: String, trim: true, default: '' },
    currentJob: { type: String, trim: true, default: '' },

    // hero (home page)
    heroLine1: { type: String, trim: true, default: '' },
    heroHighlight: { type: String, trim: true, default: '' },
    heroLine3: { type: String, trim: true, default: '' },
    heroDescription: { type: String, trim: true, default: '' },
    terminalLines: {
      type: [new Schema({ prompt: String, output: String }, { _id: false })],
      default: [],
    },

    // about page
    aboutParagraphs: { type: [String], default: [] },
    aboutStats: {
      type: [
        new Schema(
          { target: { type: Number, default: 0 }, suffix: { type: String, default: '' }, label: String },
          { _id: false }
        ),
      ],
      default: [],
    },
    aboutFacts: {
      type: [new Schema({ icon: { type: String, default: 'briefcase' }, text: String }, { _id: false })],
      default: [],
    },

    // files
    avatar: { type: fileSchema, default: null },
    resume: { type: fileSchema, default: null },

    // links
    socials: {
      type: [
        new Schema(
          { label: { type: String, trim: true }, url: { type: String, trim: true }, icon: { type: String, default: 'globe' } },
          { _id: false }
        ),
      ],
      default: [],
    },

    // footer + SEO
    footerText: { type: String, trim: true, default: '' },
    footerNote: { type: String, trim: true, default: '' },
    siteTitle: { type: String, trim: true, default: '' },
    siteDescription: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export const PROFILE_FIELDS = [
  'name', 'role', 'availability', 'location', 'email', 'phone', 'education', 'currentJob',
  'heroLine1', 'heroHighlight', 'heroLine3', 'heroDescription', 'terminalLines',
  'aboutParagraphs', 'aboutStats', 'aboutFacts',
  'avatar', 'resume', 'socials',
  'footerText', 'footerNote', 'siteTitle', 'siteDescription',
];

export default mongoose.model('Profile', profileSchema);
