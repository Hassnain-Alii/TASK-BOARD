import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";

const COLUMN_COLORS = {
  todo: {
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600",
    header: "text-slate-300",
  },
  "in-progress": {
    dot: "bg-amber-400",
    badge: "bg-amber-100 text-amber-700",
    header: "text-amber-300",
  },
  done: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
    header: "text-emerald-300",
  },
};

const Column = ({ id, title, tasks, onEditTask, onDeleteTask }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const colors = COLUMN_COLORS[id] || COLUMN_COLORS["todo"];

  return (
    <div
      className={`flex flex-col bg-white/4 rounded-2xl border border-white/[0.07] w-full md:flex-1 md:min-w-[300px] md:max-w-[450px] shrink-0 transition-all ${isOver ? "ring-2 ring-primary/50 bg-primary/5" : ""}`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
          <h3
            className={`font-bold text-sm tracking-wide uppercase ${colors.header}`}
          >
            {title}
          </h3>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}
        >
          {tasks.length}
        </span>
      </div>

      {/* Task Drop area */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-2.5 min-h-[120px]"
      >
        <SortableContext
          items={tasks.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-slate-600 border-2 border-dashed border-white/[0.07] rounded-xl">
              <span className="text-2xl mb-2">📭</span>
              <p className="text-xs font-medium">No tasks here</p>
              <p className="text-xs mt-1 opacity-60">
                Drag tasks here or add one
              </p>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default Column;
