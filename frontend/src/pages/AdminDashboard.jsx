import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Plus, Users, AlertCircle, CheckCircle2, 
  Clock, Filter, Trash2, Link as LinkIcon,
  BarChart3, LayoutGrid, List as ListIcon
} from 'lucide-react';

const AdminDashboard = () => {
  const [workItems, setWorkItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [members, setMembers] = useState([]);
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    requiredSkills: ''
  });

  // Edit Task State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Dependency State
  const [dependencies, setDependencies] = useState([]);
  const [showDependencyModal, setShowDependencyModal] = useState(false);
  const [selectedTaskForDeps, setSelectedTaskForDeps] = useState(null);
  const [newDependency, setNewDependency] = useState({
    predecessor: '',
    type: 'full',
    threshold: 100
  });

  const [statusMessage, setStatusMessage] = useState(null);

  const showStatus = (msg, type = 'success') => {
    setStatusMessage({ text: msg, type });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, statsRes, membersRes, depsRes] = await Promise.all([
        api.get('/work-items'),
        api.get('/dashboard/admin'),
        api.get('/auth/users'),
        api.get('/dependencies')
      ]);
      
      setWorkItems(itemsRes.data);
      setStats(statsRes.data);
      setMembers(membersRes.data.filter(u => u.role === 'member')); 
      setDependencies(depsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...newTask,
        requiredSkills: newTask.requiredSkills.split(',').map(s => s.trim()).filter(s => s)
      };
      await api.post('/work-items', taskData);
      setShowCreateModal(false);
      setNewTask({ title: '', description: '', priority: 'medium', assignedTo: '', requiredSkills: '' });
      showStatus('Task created successfully');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...editingTask,
        requiredSkills: typeof editingTask.requiredSkills === 'string' 
          ? editingTask.requiredSkills.split(',').map(s => s.trim()).filter(s => s)
          : editingTask.requiredSkills
      };
      await api.put(`/work-items/${editingTask._id}`, taskData);
      setShowEditModal(false);
      setEditingTask(null);
      showStatus('Task updated successfully');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Update failed');
    }
  };

  const openEditModal = (task) => {
    setEditingTask({
      ...task,
      assignedTo: task.assignedTo?._id || '',
      requiredSkills: task.requiredSkills.join(', ')
    });
    setShowEditModal(true);
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/work-items/${id}`);
      showStatus('Task deleted');
      fetchData();
    } catch (error) {
      alert('Delete failed');
    }
  };

  const handleCreateDependency = async (e) => {
    e.preventDefault();
    try {
      await api.post('/dependencies', {
        ...newDependency,
        successor: selectedTaskForDeps._id
      });
      setNewDependency({ predecessor: '', type: 'full', threshold: 100 });
      showStatus('Dependency added');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add dependency');
    }
  };

  const handleDeleteDependency = async (id) => {
    try {
      await api.delete(`/dependencies/${id}`);
      showStatus('Dependency removed');
      fetchData();
    } catch (error) {
      alert('Failed to remove dependency');
    }
  };

  const openDependencyModal = (task) => {
    setSelectedTaskForDeps(task);
    setShowDependencyModal(true);
  };

  if (loading && !stats) return <div className="flex h-64 items-center justify-center">Loading dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Toast Notification */}
      {statusMessage && (
        <div className={`fixed bottom-8 right-8 z-[100] px-6 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300 ${
          statusMessage.type === 'success' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {statusMessage.text}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500">Manage work items, assignments, and dependencies.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-100 transition-all"
        >
          <Plus size={20} />
          Create New Task
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Tasks" 
          value={stats?.summary?.totalWorkItems || 0} 
          icon={<LayoutGrid className="text-blue-600" size={20} />}
          color="bg-blue-50"
        />
        <StatCard 
          title="Blocked Tasks" 
          value={stats?.summary?.blockedItems || 0} 
          icon={<AlertCircle className="text-red-600" size={20} />}
          color="bg-red-50"
        />
        <StatCard 
          title="In Progress" 
          value={stats?.summary?.inProgressItems || 0} 
          icon={<Clock className="text-amber-600" size={20} />}
          color="bg-amber-50"
        />
        <StatCard 
          title="Completed" 
          value={stats?.summary?.doneItems || 0} 
          icon={<CheckCircle2 className="text-green-600" size={20} />}
          color="bg-green-50"
        />
      </div>

      {/* Workload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ListIcon size={20} className="text-slate-400" />
              All Work Items
            </h2>
          </div>

          <div className="space-y-4">
            {workItems.map(item => (
              <div 
                key={item._id} 
                className="group p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-md hover:shadow-slate-100 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800">{item.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-1">{item.description}</p>
                    
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Users size={14} />
                        {item.assignedTo?.name || 'Unassigned'}
                      </div>
                      <div className="bg-slate-100 h-1.5 w-24 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full transition-all" style={{ width: `${item.progress}%` }}></div>
                      </div>
                      <span>{item.progress}%</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openDependencyModal(item)}
                      className="p-2 text-slate-300 hover:text-indigo-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Manage Dependencies"
                    >
                      <LinkIcon size={18} />
                    </button>
                    <button 
                      onClick={() => openEditModal(item)}
                      className="p-2 text-slate-300 hover:text-blue-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Edit Task"
                    >
                      <Filter size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(item._id)}
                      className="p-2 text-slate-300 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Task"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {workItems.length === 0 && <p className="text-center py-8 text-slate-400">No tasks found. Create one to get started!</p>}
          </div>
        </div>

        {/* Workload Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
            <BarChart3 size={20} className="text-slate-400" />
            Team Workload
          </h2>
          <div className="space-y-6">
            {stats?.workload.map((w, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700">{w.name}</span>
                  <span className="text-blue-600 font-bold">{w.taskCount} tasks</span>
                </div>
                <div className="bg-slate-50 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (w.taskCount / 10) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <LinkIcon size={16} className="text-slate-400" />
              Dependencies Added
            </h3>
            <p className="text-xs text-slate-500 italic">
              Dependency logic is managed in the backend to ensure no circular chains and automatic unblocking.
            </p>
          </div>
        </div>
      </div>

      {/* Create Task Modal (Simplified for demo) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-8 animate-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Create New Work Item</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                  required 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Task title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  required 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24"
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                  placeholder="What needs to be done?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assigned To</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newTask.assignedTo}
                    onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}
                  >
                    <option value="">Unassigned</option>
                    {members.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Skills (comma separated)</label>
                <input 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newTask.requiredSkills}
                  onChange={e => setNewTask({...newTask, requiredSkills: e.target.value})}
                  placeholder="React, Node..."
                />
              </div>
              
              <div className="flex gap-4 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Task Modal */}
      {showEditModal && editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-8 animate-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Edit Work Item</h2>
            <form onSubmit={handleEditTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                  required 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editingTask.title}
                  onChange={e => setEditingTask({...editingTask, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  required 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24"
                  value={editingTask.description}
                  onChange={e => setEditingTask({...editingTask, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingTask.priority}
                    onChange={e => setEditingTask({...editingTask, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assigned To</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingTask.assignedTo}
                    onChange={e => setEditingTask({...editingTask, assignedTo: e.target.value})}
                  >
                    <option value="">Unassigned</option>
                    {members.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Skills (comma separated)</label>
                <input 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editingTask.requiredSkills}
                  onChange={e => setEditingTask({...editingTask, requiredSkills: e.target.value})}
                />
              </div>
              
              <div className="flex gap-4 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors"
                >
                  Update Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dependency Management Modal */}
      {showDependencyModal && selectedTaskForDeps && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl p-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Dependencies for: <span className="text-blue-600">{selectedTaskForDeps.title}</span></h2>
              <button onClick={() => setShowDependencyModal(false)} className="text-2xl font-bold text-slate-400 hover:text-slate-600 transition-colors">×</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Current Predecessors */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Current Predecessors</h3>
                <div className="space-y-3">
                  {dependencies.filter(d => d.successor?._id === selectedTaskForDeps._id).map(dep => (
                    <div key={dep._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">{dep.predecessor?.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getStatusColor(dep.predecessor?.status)}`}>
                            {dep.predecessor?.status}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                            {dep.type === 'full' ? 'Full' : `Partial (${dep.threshold}%)`}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteDependency(dep._id)}
                        className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                        title="Remove Link"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {dependencies.filter(d => d.successor?._id === selectedTaskForDeps._id).length === 0 && (
                    <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-sm text-slate-400">No predecessors defined.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Add New Dependency */}
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 h-fit">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Plus size={16} className="text-blue-600" />
                  Add New Dependency
                </h3>
                <form onSubmit={handleCreateDependency} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Predecessor Task</label>
                    <select 
                      required
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={newDependency.predecessor}
                      onChange={e => setNewDependency({...newDependency, predecessor: e.target.value})}
                    >
                      <option value="">Select a task...</option>
                      {workItems
                        .filter(item => item._id !== selectedTaskForDeps._id)
                        .filter(item => !dependencies.some(d => d.successor?._id === selectedTaskForDeps._id && d.predecessor?._id === item._id))
                        .map(item => (
                          <option key={item._id} value={item._id}>{item.title}</option>
                        ))
                      }
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                      <select 
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={newDependency.type}
                        onChange={e => setNewDependency({...newDependency, type: e.target.value})}
                      >
                        <option value="full">Full (100%)</option>
                        <option value="partial">Partial (%)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Threshold %</label>
                      <input 
                        type="number"
                        min="1"
                        max="100"
                        disabled={newDependency.type === 'full'}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:bg-slate-100 disabled:text-slate-400"
                        value={newDependency.threshold}
                        onChange={e => setNewDependency({...newDependency, threshold: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={!newDependency.predecessor}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Plus size={18} />
                    Add Link
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className={`p-6 rounded-2xl border border-slate-100 ${color} transition-all hover:scale-[1.02] duration-300`}>
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
    </div>
    <div>
      <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const getPriorityColor = (p) => {
  switch (p) {
    case 'critical': return 'bg-red-100 text-red-700';
    case 'high': return 'bg-orange-100 text-orange-700';
    case 'medium': return 'bg-blue-100 text-blue-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getStatusColor = (s) => {
  switch (s) {
    case 'done': return 'bg-green-100 text-green-700';
    case 'blocked': return 'bg-red-100 text-red-700 animate-pulse';
    case 'in-progress': return 'bg-amber-100 text-amber-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

export default AdminDashboard;
