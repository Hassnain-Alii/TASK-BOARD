import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiEdit2, FiTrash2, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';

const PRIORITY_LABEL = { high: '🔴 High', medium: '🟡 Medium', low: '🔵 Low' };
const PRIORITY_BORDER = { high: 'border-l-red-500', medium: 'border-l-amber-400', low: 'border-l-blue-500' };
const PRIORITY_BADGE  = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };

const TaskCard = ({ task, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group bg-white rounded-xl p-4 border-l-4 ${PRIORITY_BORDER[task.priority] || 'border-l-slate-300'}
        shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
        cursor-grab active:cursor-grabbing relative
        ${isDragging ? 'ring-2 ring-primary/50 shadow-lg' : ''}
      `}
      {...attributes}
      {...listeners}
    >
      <div className="flex justify-between items-start gap-2 mb-1.5">
        <h4 className="font-semibold text-slate-800 text-sm leading-snug">{task.title}</h4>
        {/* Action buttons: stop drag propagation */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onPointerDown={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-500 hover:text-primary hover:bg-indigo-50 rounded-lg transition-all"
            title="Edit"
          >
            <FiEdit2 size={13}/>
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Delete"
          >
            <FiTrash2 size={13}/>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className={PRIORITY_BADGE[task.priority]}>{PRIORITY_LABEL[task.priority]}</span>
        {task.dueDate && (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <FiClock size={11}/> {format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
