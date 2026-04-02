import WorkItem from '../models/WorkItem.js';
import Dependency from '../models/Dependency.js';
import { updateSuccessorsStatus } from '../utils/dependencyUtils.js';

/**
 * @desc Get all work items
 * @route GET /api/work-items
 * @access Private
 */
export const getWorkItems = async (req, res) => {
  try {
    const workItems = await WorkItem.find({}).populate('assignedTo', 'name email role');
    res.json(workItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Create a new work item
 * @route POST /api/work-items
 * @access Private/Admin
 */
export const createWorkItem = async (req, res) => {
  const { title, description, priority, requiredSkills, assignedTo } = req.body;

  try {
    const workItem = await WorkItem.create({
      title,
      description,
      priority,
      requiredSkills,
      assignedTo,
      status: 'in-progress' // Default to in-progress when no dependencies
    });

    res.status(201).json(workItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Update a work item (progress, status, assignment)
 * @route PUT /api/work-items/:id
 * @access Private
 */
export const updateWorkItem = async (req, res) => {
  try {
    const workItem = await WorkItem.findById(req.params.id);

    if (!workItem) {
      return res.status(404).json({ message: 'Work item not found' });
    }

    // Role check: Only admin or the assigned user can update
    if (req.user.role !== 'admin' && workItem.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    workItem.title = req.body.title || workItem.title;
    workItem.description = req.body.description || workItem.description;
    workItem.priority = req.body.priority || workItem.priority;
    workItem.status = req.body.status || workItem.status;
    workItem.progress = req.body.progress !== undefined ? req.body.progress : workItem.progress;
    workItem.assignedTo = req.body.assignedTo || workItem.assignedTo;
    workItem.requiredSkills = req.body.requiredSkills || workItem.requiredSkills;

    const updatedWorkItem = await workItem.save();

    // Trigger cascade status updates on successors
    await updateSuccessorsStatus(updatedWorkItem._id);

    res.json(updatedWorkItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Delete a work item
 * @route DELETE /api/work-items/:id
 * @access Private/Admin
 */
export const deleteWorkItem = async (req, res) => {
  try {
    const workItem = await WorkItem.findById(req.params.id);

    if (!workItem) {
      return res.status(404).json({ message: 'Work item not found' });
    }

    // Remove associated dependencies first
    await Dependency.deleteMany({
      $or: [{ predecessor: workItem._id }, { successor: workItem._id }]
    });

    await workItem.deleteOne();
    res.json({ message: 'Work item and its dependencies removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
