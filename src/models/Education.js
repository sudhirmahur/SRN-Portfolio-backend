import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema(
  {
    portfolio: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio', required: true, index: true },
    degree: { type: String, required: [true, 'Degree is required'], trim: true },
    institute: { type: String, required: [true, 'Institute is required'], trim: true },
    duration: { type: String, trim: true, default: '' },
    cgpa: { type: String, trim: true, default: '' },
    subjects: { type: [String], default: [] },
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const EDUCATION_FIELDS = ['degree', 'institute', 'duration', 'cgpa', 'subjects', 'visible', 'order'];

export default mongoose.model('Education', educationSchema);
