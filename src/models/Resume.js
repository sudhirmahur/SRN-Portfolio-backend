import mongoose from 'mongoose';

// One saved resume per admin (the chosen template + all the filled-in details).
const resumeSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, unique: true },
    template: { type: String, default: 'classic-serif', trim: true, maxlength: 60 },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false }
);

export default mongoose.model('Resume', resumeSchema);
