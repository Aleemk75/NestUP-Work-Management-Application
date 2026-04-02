import Dependency from '../models/Dependency.js';
import WorkItem from '../models/WorkItem.js';

/**
 * Circular Dependency Detection (DFS)
 * Checks if adding a dependency (predecessor -> successor) creates a cycle.
 */
export const checkCircularDependency = async (predecessorId, successorId) => {
  // If we are trying to make a task depend on itself
  if (predecessorId.toString() === successorId.toString()) return true;

  const visited = new Set();
  const queue = [predecessorId.toString()];

  // Standard BFS to see if successor can already reach predecessor
  // If B already reaches A, then A -> B creates a cycle
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === successorId.toString()) return true;

    if (!visited.has(current)) {
      visited.add(current);
      // Find all predecessors of the current task
      const deps = await Dependency.find({ successor: current });
      for (const dep of deps) {
        queue.push(dep.predecessor.toString());
      }
    }
  }

  return false;
};

/**
 * Recursive Status update cascade
 * When a task is updated, check if successors need to be unblocked.
 */
export const updateSuccessorsStatus = async (workItemId) => {
  const workItem = await WorkItem.findById(workItemId);
  if (!workItem) return;

  // Find all tasks that depend on this work item
  const dependencies = await Dependency.find({ predecessor: workItemId });

  for (const dep of dependencies) {
    const successor = await WorkItem.findById(dep.successor);
    if (!successor) continue;

    // Check if successor is blocked
    // For simplicity, a task is "blocked" if it has any dependency not met
    const allDepsOfSuccessor = await Dependency.find({ successor: successor._id });
    
    let isStillBlocked = false;
    let blockingReasons = [];

    for (const sDep of allDepsOfSuccessor) {
      const pred = await WorkItem.findById(sDep.predecessor);
      
      // If full dependency, predecessor must be 100% (done)
      if (sDep.type === 'full' && pred.progress < 100) {
        isStillBlocked = true;
        blockingReasons.push(`${pred.title} is not 100% complete`);
      }
      
      // If partial dependency, predecessor must reach threshold
      if (sDep.type === 'partial' && pred.progress < sDep.threshold) {
        isStillBlocked = true;
        blockingReasons.push(`${pred.title} is below threshold (${sDep.threshold}%)`);
      }
    }

    // Update status based on unblocking
    if (!isStillBlocked) {
      if (successor.status === 'blocked') {
        successor.status = 'in-progress';
        await successor.save();
        // Recurse: unblocking this task might unblock others
        await updateSuccessorsStatus(successor._id);
      }
    } else {
      if (successor.status !== 'blocked') {
        successor.status = 'blocked';
        await successor.save();
        // Recurse: blocking this task might block others downstream ?
        // Actually blocking shouldn't necessarily cascade unless logic dictates
      }
    }
  }
};
