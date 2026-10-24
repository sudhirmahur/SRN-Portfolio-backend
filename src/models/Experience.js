import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema(
  {
    portfolio: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio', required: true, index: true },
    position: { type: String, required: [true, 'Position is required'], trim: true },
    company: { type: String, required: [true, 'Company is required'], trim: true },
    location: { type: String, trim: true, default: '' },
    duration: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    responsibilities: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const EXPERIENCE_FIELDS = [
  'position', 'company', 'location', 'duration', 'description',
  'responsibilities', 'technologies', 'visible', 'order',
];

export default mongoose.model('Experience', experienceSchema);
