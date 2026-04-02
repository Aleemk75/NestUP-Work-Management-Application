import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  CheckCircle2, Clock, AlertTriangle, 
  ChevronRight, RefreshCw, Layers
} from 'lucide-react';

const MemberDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [blockingTasks, setBlockingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  useEffect(() => {
    fetchMemberData();
  }, []);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/dashboard/member');
      setTasks(data.assignedTasks);
      setBlockingTasks(data.blockingTasks);
    } catch (error) {
      console.error('Error fetching member stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (id, newProgress) => {
    try {
      setUpdating(id);
      let status = 'in-progress';
      if (newProgress === 100) status = 'done';
      
      await api.put(`/work-items/${id}`, { progress: newProgress, status });
      // Refresh to see if anything unblocked or status changed
      await fetchMemberData();
      showSuccess('Progress updated');
    } catch (error) {
      alert(error.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  if (loading && tasks.length === 0) return <div className="flex h-64 items-center justify-center">Loading your tasks...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed bottom-8 right-8 z-[100] px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          {successMsg}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Dashboard</h1>
          <p className="text-slate-500">Track and update your assigned work items.</p>
        </div>
        <button 
          onClick={fetchMemberData}
          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Task List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
            <Clock size={20} className="text-blue-600" />
            Active Assignments
          </h2>
          
          {tasks.map(task => (
            <div 
              key={task._id} 
              className={`bg-white rounded-2xl p-6 border shadow-sm transition-all hover:shadow-md ${
                task.status === 'blocked' ? 'border-red-100 bg-red-50/10' : 'border-slate-100'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.status === 'blocked' && (
                      <span className="flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 animate-pulse">
                        <AlertTriangle size={10} />
                        Blocked
                      </span>
                    )}
                    {task.status === 'done' && (
                      <span className="flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        <CheckCircle2 size={10} />
                        Done
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg uppercase tracking-tight">{task.title}</h3>
                  <p className="text-sm text-slate-500 mb-4">{task.description}</p>
                  
                  {/* Progress Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        disabled={task.status === 'blocked' || updating === task._id}
                        value={task.progress}
                        onChange={(e) => handleUpdateProgress(task._id, parseInt(e.target.value))}
                        className="flex-1 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {task.status === 'blocked' && (
                <div className="mt-4 p-4 bg-red-50/50 border border-red-100 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3 text-red-700 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle size={14} />
                    Blocking Predecessors
                  </div>
                  <div className="space-y-2">
                    {task.blockingDetails?.map((detail, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-red-50">
                        <span className="font-medium text-slate-700">{detail.predecessorTitle}</span>
                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase">
                          {detail.type === 'full' ? '100% Required' : `${detail.threshold}% Required`}
                        </span>
                      </div>
                    ))}
                    {(!task.blockingDetails || task.blockingDetails.length === 0) && (
                      <p className="text-xs text-red-500 italic">One or more upstream tasks are currently in progress.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {tasks.length === 0 && (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
              <CheckCircle2 size={48} className="mx-auto mb-4 opacity-10" />
              <p className="font-medium">All caught up! No tasks assigned currently.</p>
            </div>
          )}
        </div>

        {/* Sidebar: Downstream Impact */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-fit">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4 uppercase tracking-wider">
              <Layers size={18} className="text-slate-400" />
              Impact Tracker
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              See which tasks are waiting for you to complete your dependencies.
            </p>
            
            <div className="space-y-4">
              {blockingTasks.map((impact, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <ChevronRight size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{impact.taskTitle}</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-medium">Blocking {impact.impactedCount} successor(s)</p>
                  </div>
                </div>
              ))}
              
              {blockingTasks.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  Your work isn't currently blocking any other tasks.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getPriorityColor = (p) => {
  switch (p) {
    case 'critical': return 'bg-red-100 text-red-700';
    case 'high': return 'bg-orange-100 text-orange-700';
    case 'medium': return 'bg-blue-100 text-blue-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

export default MemberDashboard;
