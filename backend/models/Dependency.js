import mongoose from 'mongoose';

const dependencySchema = new mongoose.Schema({
  predecessor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkItem',
    required: true
  },
  successor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkItem',
    required: true
  },
  type: {
    type: String,
    enum: ['partial', 'full'],
    default: 'full'
  },
  threshold: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 100 // Full dependency is 100%, Partial is according to threshold
  }
}, {
  timestamps: true
});

const Dependency = mongoose.model('Dependency', dependencySchema);

export default Dependency;
