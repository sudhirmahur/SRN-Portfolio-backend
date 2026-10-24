import mongoose from 'mongoose';

const { Schema } = mongoose;

const skillSchema = new Schema({
  name: { type: String, required: [true, 'Skill name is required'], trim: true },
  icon: { type: String, trim: true, default: 'code' },
  level: { type: Number, min: 0, max: 100, default: 80 },
  description: { type: String, trim: true, default: '' },
});

const skillCategorySchema = new Schema(
  {
    portfolio: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio', required: true, index: true },
    title: { type: String, required: [true, 'Category title is required'], trim: true },
    skills: { type: [skillSchema], default: [] },
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SKILL_FIELDS = ['title', 'skills', 'visible', 'order'];

export default mongoose.model('SkillCategory', skillCategorySchema);
