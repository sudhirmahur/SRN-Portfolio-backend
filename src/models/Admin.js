import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: 'Admin' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
    blocked: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    password: { type: String, required: true, minlength: [6, 'Password must be at least 6 characters'], select: false },
  },
  { timestamps: true }
);

adminSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

adminSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('Admin', adminSchema);
