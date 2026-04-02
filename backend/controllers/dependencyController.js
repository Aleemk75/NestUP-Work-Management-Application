import Dependency from '../models/Dependency.js';
import WorkItem from '../models/WorkItem.js';
import { checkCircularDependency, updateSuccessorsStatus } from '../utils/dependencyUtils.js';

/**
 * @desc Get all dependencies
 * @route GET /api/dependencies
 * @access Private
 */
export const getDependencies = async (req, res) => {
  try {
    const deps = await Dependency.find({})
      .populate('predecessor', 'title status progress')
      .populate('successor', 'title status progress');
    res.json(deps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Create a new dependency between tasks
 * @route POST /api/dependencies
 * @access Private/Admin
 */
export const createDependency = async (req, res) => {
  const { predecessor, successor, type, threshold } = req.body;

  try {
    const isCircular = await checkCircularDependency(predecessor, successor);
    if (isCircular) {
      return res.status(400).json({ message: 'Circular dependency detected' });
    }

    const dependency = await Dependency.create({
      predecessor,
      successor,
      type,
      threshold
    });

    // Update successor status immediately based on the new dependency
    await updateSuccessorsStatus(successor);

    res.status(201).json(dependency);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Delete a dependency
 * @route DELETE /api/dependencies/:id
 * @access Private/Admin
 */
export const deleteDependency = async (req, res) => {
  try {
    const dependency = await Dependency.findById(req.params.id);

    if (!dependency) {
      return res.status(404).json({ message: 'Dependency not found' });
    }

    const successorId = dependency.successor;
    await dependency.deleteOne();

    // After deleting a dependency, the successor might become unblocked
    await updateSuccessorsStatus(successorId);

    res.json({ message: 'Dependency removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
