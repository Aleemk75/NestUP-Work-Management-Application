import WorkItem from '../models/WorkItem.js';
import User from '../models/User.js';
import Dependency from '../models/Dependency.js';

/**
 * @desc Get Admin Dashboard Stats
 * @route GET /api/dashboard/admin
 * @access Private/Admin
 */
export const getAdminStats = async (req, res) => {
  try {
    const totalWorkItems = await WorkItem.countDocuments();
    const blockedItems = await WorkItem.countDocuments({ status: 'blocked' });
    const doneItems = await WorkItem.countDocuments({ status: 'done' });
    const inProgressItems = await WorkItem.countDocuments({ status: 'in-progress' });

    // Workload calculation
    const members = await User.find({ role: 'member' });
    const workload = [];

    for (const member of members) {
      const taskCount = await WorkItem.countDocuments({ assignedTo: member._id, status: { $ne: 'done' } });
      workload.push({
        name: member.name,
        taskCount
      });
    }

    // Bottlenecks: defined as blocked tasks or tasks with high dependency
    const bottlenecks = await WorkItem.find({ status: 'blocked' }).limit(5);

    res.json({
      summary: {
        totalWorkItems,
        blockedItems,
        doneItems,
        inProgressItems
      },
      workload,
      bottlenecks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get Member Dashboard Stats
 * @route GET /api/dashboard/member
 * @access Private/Member
 */
export const getMemberStats = async (req, res) => {
  try {
    const assignedTasks = await WorkItem.find({ assignedTo: req.user._id });
    
    // Enrich assigned tasks with blocking info if they are blocked
    const enrichedTasks = await Promise.all(assignedTasks.map(async (task) => {
      const taskObj = task.toObject();
      if (task.status === 'blocked') {
        const deps = await Dependency.find({ successor: task._id }).populate('predecessor', 'title name');
        taskObj.blockingDetails = deps.map(d => ({
          predecessorTitle: d.predecessor.title,
          type: d.type,
          threshold: d.threshold
        }));
      }
      return taskObj;
    }));

    // Find tasks that this user is currently blocking
    const blockingTasks = [];
    for (const task of assignedTasks) {
      const deps = await Dependency.find({ predecessor: task._id });
      if (deps.length > 0) {
        blockingTasks.push({
          taskTitle: task.title,
          impactedCount: deps.length
        });
      }
    }

    res.json({
      assignedTasks: enrichedTasks,
      blockingTasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
