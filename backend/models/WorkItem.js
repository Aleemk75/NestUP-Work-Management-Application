import mongoose from 'mongoose';

const workItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['blocked', 'in-progress', 'done'],
    default: 'in-progress'
  },
  progress: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  requiredSkills: [String]
}, {
  timestamps: true
});

const WorkItem = mongoose.model('WorkItem', workItemSchema);

export default WorkItem;
