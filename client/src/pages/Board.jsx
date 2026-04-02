import React, { useState, useEffect } from 'react';
import {
  DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { differenceInDays } from 'date-fns';
import { FiAlertTriangle, FiCheckCircle, FiClock, FiList, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import Navbar from '../components/Navbar';
import Column from '../components/Column';
import TaskModal from '../components/TaskModal';
import Toast from '../components/Toast';
import api from '../api/taskApi';

const COLUMNS = [
  { id: 'todo',        title: 'To Do'       },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done',        title: 'Done'        },
];

const Board = () => {
  const [tasks, setTasks]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [debouncedSearch, setDebounced] = useState('');
  const [filterPriority, setFilter]   = useState('all');
  const [isModalOpen, setModalOpen]   = useState(false);
  const [taskToEdit, setTaskToEdit]   = useState(null);
  const [taskToDelete, setDeleteTask] = useState(null);
  const [toast, setToast]             = useState(null);
  const [statsOpen, setStatsOpen]     = useState(true);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => { fetchTasks(); }, []); // eslint-disable-line

  // ✅ Fixed: 300ms debounce (was 3000ms)
  useEffect(() => {
    const h = setTimeout(() => setDebounced(searchTerm), 300);
    return () => clearTimeout(h);
  }, [searchTerm]);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch { showToast('Failed to load tasks', 'error'); }
    finally { setLoading(false); }
  };

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  // ── Drag End ────────────────────────────────────────────────────────────────
  const handleDragEnd = async ({ active, over }) => {
    if (!over) return;

    const activeId = active.id;
    const overId   = over.id;
    const taskIdx  = tasks.findIndex(t => t._id === activeId);
    if (taskIdx === -1) return;

    const task = tasks[taskIdx];
    let newStatus = task.status;

    if (COLUMNS.some(c => c.id === overId)) {
      if (task.status !== overId) newStatus = overId;
    } else {
      const overTask = tasks.find(t => t._id === overId);
      if (overTask && overTask.status !== task.status) newStatus = overTask.status;
    }

    if (newStatus !== task.status) {
      setTasks(prev => prev.map(t => t._id === activeId ? { ...t, status: newStatus } : t));
      try {
        await api.put(`/tasks/${activeId}`, { status: newStatus });
      } catch {
        setTasks(tasks); // revert
        showToast('Failed to move task', 'error');
      }
    }
  };

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleSave = async (data) => {
    try {
      if (taskToEdit) {
        const res = await api.put(`/tasks/${taskToEdit._id}`, data);
        setTasks(prev => prev.map(t => t._id === taskToEdit._id ? res.data : t));
        showToast('Task updated!');
      } else {
        const res = await api.post('/tasks', { ...data, status: 'todo' });
        setTasks(prev => [res.data, ...prev]);
        showToast('Task created!');
      }
      setModalOpen(false);
      setTaskToEdit(null);
    } catch { showToast('Error saving task', 'error'); }
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await api.delete(`/tasks/${taskToDelete._id}`);
      setTasks(prev => prev.filter(t => t._id !== taskToDelete._id));
      showToast('Task deleted');
    } catch { showToast('Error deleting task', 'error'); }
    finally { setDeleteTask(null); }
  };

  // ── Filter & Search ─────────────────────────────────────────────────────────
  const filtered = tasks.filter(t => {
    const matchP = filterPriority === 'all' || t.priority === filterPriority;
    const matchS = !debouncedSearch ||
      t.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchP && matchS;
  });

  // ── Stats ───────────────────────────────────────────────────────────────────
  const overdue    = tasks.filter(t => t.dueDate && t.status !== 'done' && differenceInDays(new Date(), new Date(t.dueDate)) > 0);
  const highPri    = tasks.filter(t => t.priority === 'high' && t.status !== 'done');
  const doneCount  = tasks.filter(t => t.status === 'done').length;
  const completePct = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Delete Confirmation */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass-card w-full max-w-sm p-8 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-lg font-bold mb-2">Delete Task?</h3>
            <p className="text-slate-400 text-sm mb-6">
              "<span className="text-slate-200 font-medium">{taskToDelete.title}</span>" will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button className="btn-ghost flex-1" onClick={() => setDeleteTask(null)}>Cancel</button>
              <button className="btn-danger flex-1" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <TaskModal
          key={taskToEdit?._id || 'new'}
          onClose={() => { setModalOpen(false); setTaskToEdit(null); }}
          onSave={handleSave}
          taskToEdit={taskToEdit}
        />
      )}

      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterPriority={filterPriority}
        setFilterPriority={setFilter}
        onAddTask={() => { setTaskToEdit(null); setModalOpen(true); }}
      />

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Board Columns */}
        <main className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 p-4 md:p-6 h-full" style={{ minWidth: 'min-content' }}>
            {loading ? (
              COLUMNS.map(c => (
                <div key={c.id} className="w-80 shrink-0 rounded-2xl bg-white/4 border border-white/[0.07] p-4 space-y-3">
                  <div className="skeleton h-6 w-28" />
                  <div className="skeleton h-28" />
                  <div className="skeleton h-24" />
                </div>
              ))
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                {COLUMNS.map(col => (
                  <Column
                    key={col.id}
                    id={col.id}
                    title={col.title}
                    tasks={filtered.filter(t => t.status === col.id)}
                    onEditTask={t => { setTaskToEdit(t); setModalOpen(true); }}
                    onDeleteTask={id => setDeleteTask(tasks.find(t => t._id === id))}
                  />
                ))}
              </DndContext>
            )}
          </div>
        </main>

        {/* Stats Panel */}
        <aside className={`relative shrink-0 border-l border-white/10 bg-slate-900/40 backdrop-blur-sm transition-all duration-300 ${statsOpen ? 'w-64' : 'w-10'}`}>
          {/* Toggle button */}
          <button
            onClick={() => setStatsOpen(!statsOpen)}
            className="absolute -left-3 top-6 z-10 w-6 h-6 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-600 transition-all"
          >
            {statsOpen ? <FiChevronRight size={12}/> : <FiChevronLeft size={12}/>}
          </button>

          {statsOpen && (
            <div className="p-4 space-y-4 overflow-y-auto h-full">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Board Stats</h3>

              {/* Progress ring */}
              <div className="flex flex-col items-center py-2">
                <div className="relative w-20 h-20 mb-2">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7"/>
                    <circle
                      cx="40" cy="40" r="34" fill="none"
                      stroke="#10b981" strokeWidth="7"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - completePct / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-emerald-400">{completePct}%</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400">Completion rate</p>
              </div>

              {/* Stat cards */}
              {[
                { icon: <FiList size={14}/>, label: 'Total Tasks',    value: tasks.length,      color: 'text-indigo-400'  },
                { icon: <FiCheckCircle size={14}/>, label: 'Completed',  value: doneCount,     color: 'text-emerald-400' },
                { icon: <FiAlertTriangle size={14}/>, label: 'Overdue', value: overdue.length,  color: 'text-red-400'     },
                { icon: <FiClock size={14}/>, label: 'High Priority',  value: highPri.length,   color: 'text-amber-400'   },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between p-3 rounded-xl bg-white/4 border border-white/6">
                  <div className="flex items-center gap-2">
                    <span className={stat.color}>{stat.icon}</span>
                    <span className="text-xs text-slate-400">{stat.label}</span>
                  </div>
                  <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                </div>
              ))}

              {/* Column breakdown */}
              <div className="space-y-2 pt-2 border-t border-white/6">
                <p className="text-xs text-slate-500 font-medium uppercase">Breakdown</p>
                {COLUMNS.map(col => {
                  const count = tasks.filter(t => t.status === col.id).length;
                  const pct   = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                  return (
                    <div key={col.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400 capitalize">{col.title}</span>
                        <span className="text-slate-300 font-medium">{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/6">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${col.id === 'done' ? 'bg-emerald-500' : col.id === 'in-progress' ? 'bg-amber-400' : 'bg-slate-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Board;
