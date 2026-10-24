import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    portfolio: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    read: { type: Boolean, default: false },
    ip: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);
