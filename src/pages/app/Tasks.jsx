import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import {
  Card,
  EmptyState,
  ErrorState,
  Skeleton,
  Badge,
  Button,
  Input,
  Textarea,
} from "../../components/ui/index";

const PRIORITIES = ["low", "medium", "high"];
const CATEGORIES = ["general", "academic", "personal", "health"];

const PRIORITY_STYLES = {
  low: { badge: "neutral", label: "Low" },
  medium: { badge: "warning", label: "Medium" },
  high: { badge: "danger", label: "High" },
};

const CATEGORY_ICONS = {
  general: (
    <svg
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      />
    </svg>
  ),
  academic: (
    <svg
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
      />
    </svg>
  ),
  personal: (
    <svg
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  health: (
    <svg
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  ),
};

const CATEGORY_STYLES = {
  general: { label: "General" },
  academic: { label: "Academic" },
  personal: { label: "Personal" },
  health: { label: "Health" },
};

const FILTERS = ["all", "active", "completed"];

function TaskForm({ onSave, onCancel, initial = {} }) {
  const [form, setForm] = useState({
    title: initial.title || "",
    description: initial.description || "",
    due_date: initial.due_date || "",
    priority: initial.priority || "medium",
    category: initial.category || "general",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Task title is required");
      return;
    }
    setLoading(true);
    await onSave(form);
    // await fetchTasks();
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        label="Task title"
        placeholder="What needs to be done?"
        value={form.title}
        onChange={set("title")}
        error={error}
        autoFocus
      />
      <Textarea
        label="Description (optional)"
        placeholder="Add some details..."
        value={form.description}
        onChange={set("description")}
        rows={2}
      />
      <Input
        label="Due date (optional)"
        type="date"
        value={form.due_date}
        onChange={set("due_date")}
        className="w-full"
      />

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1.5">
          Priority
        </label>
        <div className="flex gap-2">
          {PRIORITIES.map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all
                ${
                  form.priority === p
                    ? "bg-primary-400 text-white"
                    : "bg-primary-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-primary-100"
                }`}
            >
              {PRIORITY_STYLES[p].label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1.5">
          Category
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setForm((prev) => ({ ...prev, category: c }))}
              className={`flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all
                ${
                  form.category === c
                    ? "bg-primary-400 text-white"
                    : "bg-primary-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-primary-100"
                }`}
            >
              <span>{CATEGORY_STYLES[c].emoji}</span>
              {CATEGORY_STYLES[c].label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" className="flex-1" loading={loading}>
          {initial.id ? "Save changes" : "Add task"}
        </Button>
      </div>
    </form>
  );
}

function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const isOverdue =
    task.due_date &&
    !task.is_completed &&
    new Date(task.due_date) < new Date(new Date().toDateString());

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-2xl border p-4 transition-all duration-200
      ${
        task.is_completed
          ? "border-slate-100 dark:border-slate-700 opacity-60"
          : "border-slate-100 dark:border-slate-700 shadow-card"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task)}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center
            shrink-0 transition-all duration-200
            ${
              task.is_completed
                ? "bg-teal-400 border-teal-400"
                : "border-slate-300 hover:border-primary-400"
            }`}
        >
          {task.is_completed && (
            <svg
              width="10"
              height="10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium leading-snug
            ${
              task.is_completed
                ? "line-through text-slate-400"
                : "text-slate-700 dark:text-slate-200"
            }`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant={PRIORITY_STYLES[task.priority]?.badge || "neutral"}>
              {PRIORITY_STYLES[task.priority]?.label}
            </Badge>
            <span className="text-[10px] text-slate-400">
              {CATEGORY_STYLES[task.category]?.emoji}{" "}
              {CATEGORY_STYLES[task.category]?.label}
            </span>
            {task.due_date && (
              <span
                className={`text-[10px] font-medium
                ${isOverdue ? "text-red-400" : "text-slate-400"}`}
              >
                {isOverdue ? "⚠ Overdue · " : ""}Due {formatDate(task.due_date)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="w-7 h-7 rounded-lg flex items-center justify-center
              text-slate-400 hover:text-primary-400 hover:bg-primary-50 transition-all"
          >
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center
              text-slate-400 hover:text-red-400 hover:bg-red-50 transition-all"
          >
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Tasks() {
  const { session, refreshTaskCount } = useApp();
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setTasks(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [session.user.id]);

  const handleAdd = async (form) => {
    const { data, error } = await supabase
      .from("tasks")
      .insert({ ...form, user_id: session.user.id })
      .select()
      .single();
    if (error) {
      toast("Could not add task", "error");
      return;
    }
    setTasks((prev) => [data, ...prev]);
    setShowForm(false);
    toast("Task added", "success");
    refreshTaskCount();
  };

  const handleEdit = async (form) => {
    const { data, error } = await supabase
      .from("tasks")
      .update(form)
      .eq("id", editingTask.id)
      .select()
      .single();
    if (error) {
      toast("Could not update task", "error");
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
    setEditingTask(null);
    toast("Task updated", "success");
  };

  const handleToggle = async (task) => {
    const { data, error } = await supabase
      .from("tasks")
      .update({ is_completed: !task.is_completed })
      .eq("id", task.id)
      .select()
      .single();
    if (error) {
      toast("Could not update task", "error");
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
    refreshTaskCount();
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      toast("Could not delete task", "error");
      return;
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setDeleteConfirm(null);
    toast("Task deleted", "success");
    refreshTaskCount();
  };

  const filtered = tasks.filter((t) => {
    const statusMatch =
      filter === "all"
        ? true
        : filter === "active"
        ? !t.is_completed
        : t.is_completed;
    const categoryMatch =
      categoryFilter === "all" || t.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  const activeTasks = tasks.filter((t) => !t.is_completed);
  const overdueTasks = tasks.filter(
    (t) =>
      !t.is_completed &&
      t.due_date &&
      new Date(t.due_date) < new Date(new Date().toDateString())
  );

  return (
    <div className="min-h-screen bg-surfacedark:bg-slate-900 page-enter">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-display text-xl font-bold text-slate-800 dark:text-white">
            Tasks
          </h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingTask(null);
            }}
            className="w-9 h-9 rounded-2xl bg-primary-400 flex items-center justify-center
              text-white shadow-soft transition-all active:scale-95 hover:bg-primary-500"
          >
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        {/* Stats row */}
        {tasks.length > 0 && (
          <div className="flex gap-3 mt-3">
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-3 text-center shadow-card">
              <p className="font-display font-bold text-lg text-slate-700 dark:text-slate-200">
                {activeTasks.length}
                {/* {console.log(activeTasks.length)} */}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">Active</p>
            </div>
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-3 text-center shadow-card">
              <p className="font-display font-bold text-lg text-slate-700 dark:text-slate-200">
                {tasks.filter((t) => t.is_completed).length}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">Done</p>
            </div>
            {overdueTasks.length > 0 && (
              <div className="flex-1 bg-red-50 rounded-2xl border border-red-100 p-3 text-center">
                <p className="font-display font-bold text-lg text-red-500">
                  {overdueTasks.length}
                </p>
                <p className="text-[10px] text-red-400 font-medium">Overdue</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit form */}
      {(showForm || editingTask) && (
        <div className="px-5 mb-4">
          <Card className="dark:bg-slate-800">
            <h3 className="font-display font-semibold text-slate-700 dark:text-slate-200 text-sm mb-4">
              {editingTask ? "Edit task" : "New task"}
            </h3>
            <TaskForm
              initial={editingTask || {}}
              onSave={editingTask ? handleEdit : handleAdd}
              onCancel={() => {
                setShowForm(false);
                setEditingTask(null);
              }}
            />
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="px-5 mb-4">
        {/* Status filter */}
        <div className="flex gap-2 mb-3">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all capitalize
                ${
                  filter === f
                    ? "bg-primary-400 text-white"
                    : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400  border border-slate-100 dark:border-slate-700"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all shrink-0
              ${
                categoryFilter === "all"
                  ? "bg-slate-700 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700"
              }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium
      transition-all shrink-0
      ${
        categoryFilter === c
          ? "bg-slate-700 text-white"
          : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700"
      }`}
            >
              <span
                className={
                  categoryFilter === c ? "text-white" : "text-slate-400"
                }
              >
                {CATEGORY_ICONS[c]}
              </span>
              {CATEGORY_STYLES[c].label}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="px-5 pb-8 flex flex-col gap-2">
        {loading && (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        )}

        {!loading && error && (
          <ErrorState description={error} onRetry={fetchTasks} />
        )}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon={
              <svg
                width="28"
                height="28"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            }
            title={
              filter === "completed"
                ? "No completed tasks yet"
                : "No tasks here"
            }
            description={
              filter === "all"
                ? "Tap the + button to add your first task."
                : filter === "active"
                ? "All caught up — no active tasks."
                : "Complete some tasks to see them here."
            }
            action={
              filter === "all" && (
                <Button size="sm" onClick={() => setShowForm(true)}>
                  Add your first task
                </Button>
              )
            }
          />
        )}

        {!loading &&
          !error &&
          filtered.map((task) => (
            <div key={task.id}>
              {deleteConfirm === task.id ? (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30 p-4">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-3">
                    Delete this task?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => setDeleteConfirm(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(task.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <TaskItem
                  task={task}
                  onToggle={handleToggle}
                  onEdit={(t) => {
                    setEditingTask(t);
                    setShowForm(false);
                  }}
                  onDelete={(id) => setDeleteConfirm(id)}
                />
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
