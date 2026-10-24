import mongoose from 'mongoose';

const certificationSchema = new mongoose.Schema(
  {
    portfolio: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio', required: true, index: true },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    issuer: { type: String, trim: true, default: '' },
    year: { type: String, trim: true, default: '' },
    credentialUrl: { type: String, trim: true, default: '' },
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const CERTIFICATION_FIELDS = ['title', 'issuer', 'year', 'credentialUrl', 'visible', 'order'];

export default mongoose.model('Certification', certificationSchema);
