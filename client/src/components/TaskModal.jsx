import { useState } from 'react';
import api from '../api/taskApi';
import { FiX, FiPaperclip, FiFile, FiDownload, FiLoader } from 'react-icons/fi';

const TaskModal = ({ onClose, onSave, taskToEdit }) => {
  const [form, setForm] = useState({
    title:       taskToEdit?.title || '',
    description: taskToEdit?.description || '',
    priority:    taskToEdit?.priority || 'low',
    dueDate:     taskToEdit?.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '',
  });

  const [attachments, setAttachments] = useState(taskToEdit?.attachments || []);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !taskToEdit?._id) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(`/tasks/${taskToEdit._id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAttachments(res.data.attachments);
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.msg || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({ ...form, attachments });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm animate-fadeIn p-4">
      {/* Modal container: max height + scrollable body so it never goes off-screen */}
      <div className="w-full max-w-md glass-card rounded-2xl! shadow-2xl flex flex-col" style={{ maxHeight: 'calc(100vh - 2rem)' }}>

        {/* Header — always visible, never scrolls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-lg font-bold">{taskToEdit ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <FiX size={20}/>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Title <span className="text-danger">*</span></label>
              <input
                type="text"
                className="input-field"
                placeholder="What needs to be done?"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Optional description..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Priority</label>
                <select
                  className="input-field"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="low">🔵 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Due Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
            </div>

            {/* Attachments — only shown when editing an existing task */}
            {taskToEdit && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                  <FiPaperclip size={14}/> Attachments
                </label>

                <div className="space-y-2">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FiFile className="text-indigo-400 shrink-0" />
                        <span className="text-xs text-slate-300 truncate">{file.name}</span>
                      </div>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                        title="Download"
                      >
                        <FiDownload size={14} />
                      </a>
                    </div>
                  ))}

                  <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                    {uploading ? (
                      <>
                        <FiLoader className="animate-spin text-indigo-400" />
                        <span className="text-xs text-slate-400">Uploading to Cloud...</span>
                      </>
                    ) : (
                      <>
                        <FiPaperclip className="text-slate-500" />
                        <span className="text-xs text-slate-400">Click to attach a file (Notes, PDFs, Images)</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            )}

            {/* Footer buttons inside the form */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1 w-auto!">{taskToEdit ? 'Save Changes' : 'Add Task'}</button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default TaskModal;
