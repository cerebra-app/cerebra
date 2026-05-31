import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import {
  Card,
  Skeleton,
  EmptyState,
  ErrorState,
  Button,
  Textarea,
} from "../../components/ui/index";

// ── Mood options ──────────────────────────────────────────────
const MOODS = [
  {
    id: "great",
    label: "Great",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <circle cx="12" cy="12" r="10" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 13s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"
        />
      </svg>
    ),
  },
  {
    id: "good",
    label: "Good",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <circle cx="12" cy="12" r="10" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 14s1.5 1.5 4 1.5 4-1.5 4-1.5M9 9h.01M15 9h.01"
        />
      </svg>
    ),
  },
  {
    id: "okay",
    label: "Okay",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <circle cx="12" cy="12" r="10" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6M9 9h.01M15 9h.01"
        />
      </svg>
    ),
  },
  {
    id: "low",
    label: "Low",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <circle cx="12" cy="12" r="10" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 15s1.5-1.5 4-1.5 4 1.5 4 1.5M9 9h.01M15 9h.01"
        />
      </svg>
    ),
  },
  {
    id: "rough",
    label: "Rough",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <circle cx="12" cy="12" r="10" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 16s1.5-2 4-2 4 2 4 2M9 9h.01M15 9h.01"
        />
      </svg>
    ),
  },
];

const MOOD_COLORS = {
  great: "text-teal-500 bg-teal-50 border-teal-200",
  good: "text-primary-500 bg-primary-50 border-primary-200",
  okay: "text-amber-500 bg-amber-50 border-amber-200",
  low: "text-orange-500 bg-orange-50 border-orange-200",
  rough: "text-red-500 bg-red-50 border-red-200",
};

// ── PIN Pad ──────────────────────────────────────────────
function PinPad({
  title,
  subtitle,
  onComplete,
  onCancel,
  confirmMode = false,
}) {
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [stage, setStage] = useState("enter"); // enter | confirm
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const current = stage === "confirm" ? confirm : pin;

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleDigit = (d) => {
    if (current.length >= 4) return;
    const next = current + d;
    if (stage === "enter") {
      setPin(next);
      if (next.length === 4) {
        if (confirmMode) {
          setTimeout(() => setStage("confirm"), 200);
        } else {
          setTimeout(() => onComplete(next), 200);
        }
      }
    } else {
      setConfirm(next);
      if (next.length === 4) {
        if (next === pin) {
          setTimeout(() => onComplete(pin), 200);
        } else {
          setError("PINs do not match. Try again.");
          triggerShake();
          setTimeout(() => {
            setConfirm("");
            setPin("");
            setStage("enter");
            setError("");
          }, 1000);
        }
      }
    }
  };

  const handleDelete = () => {
    if (stage === "enter") setPin((p) => p.slice(0, -1));
    else setConfirm((c) => c.slice(0, -1));
  };

  const displayTitle =
    confirmMode && stage === "confirm" ? "Confirm your PIN" : title;
  const displaySubtitle =
    confirmMode && stage === "confirm" ? "Enter the same PIN again" : subtitle;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 animate-fade-in">
      {/* Lock icon */}
      <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-6">
        <svg
          width="28"
          height="28"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#7C6FF7"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>

      <h2 className="font-display text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 text-center">
        {displayTitle}
      </h2>
      <p className="text-sm text-slate-400 dark:text-slate-500 text-center mb-8">
        {displaySubtitle}
      </p>

      {/* PIN dots */}
      <div
        className={`flex gap-4 mb-3 ${
          shake ? "animate-[shake_0.4s_ease-in-out]" : ""
        }`}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-200
            ${
              current.length > i
                ? "bg-primary-400 border-primary-400"
                : "border-slate-300"
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-xs text-red-500 mb-4 text-center">{error}</p>
      )}
      {!error && <div className="mb-4 h-4" />}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(String(d))}
            className="h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-card
    font-display font-semibold text-xl text-slate-700 dark:text-slate-200
    transition-all active:scale-95 active:bg-primary-50 hover:border-primary-200"
          >
            {d}
          </button>
        ))}
        <div />
        <button
          onClick={() => handleDigit("0")}
          className="h-14 rounded-2xl bg-white border border-slate-100 shadow-card
            font-display font-semibold text-xl text-slate-700
            transition-all active:scale-95 active:bg-primary-50 hover:border-primary-200"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-card
    flex items-center justify-center text-slate-500 dark:text-slate-400
    transition-all active:scale-95 active:bg-primary-50 hover:border-primary-200"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
            />
          </svg>
        </button>
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-8 text-sm text-slate-400 hover:text-primary-400 transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

// ── Entry Card ──────────────────────────────────────────────
function EntryCard({ entry, onClick }) {
  const date = new Date(entry.created_at);
  const formatted = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const mood = MOODS.find((m) => m.id === entry.mood);
  const preview =
    entry.content.slice(0, 100) + (entry.content.length > 100 ? "…" : "");

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-slate-800 rounded-2xl border border-slate-100
    dark:border-slate-700 shadow-card p-4 transition-all duration-200 hover:shadow-glow active:scale-[0.99]"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
          {formatted}
        </span>
        {mood && (
          <span
            className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5
            rounded-full border ${MOOD_COLORS[entry.mood]}`}
          >
            {mood.icon}
            {mood.label}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {preview}
      </p>
    </button>
  );
}

// ── Write Entry ──────────────────────────────────────────────
function WriteEntry({ entry, onSave, onDelete, onBack }) {
  const toast = useToast();
  const [content, setContent] = useState(entry?.content || "");
  const [mood, setMood] = useState(entry?.mood || null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    textRef.current?.focus();
  }, []);

  const handleSave = async () => {
    if (!content.trim()) {
      toast("Write something first", "warning");
      return;
    }
    setLoading(true);
    await onSave({ content: content.trim(), mood });
    setLoading(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(entry.id);
    setDeleting(false);
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-slate-900">
      {/* Header */}
      <div className="px-5 pt-8 pb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-primary-400 transition-colors"
        >
          <svg
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-sm font-medium">Journal</span>
        </button>
        <div className="flex items-center gap-2">
          {entry && (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="w-8 h-8 rounded-xl flex items-center justify-center
                text-slate-400 hover:text-red-400 hover:bg-red-50 transition-all"
            >
              <svg
                width="16"
                height="16"
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
          )}
          <button
            onClick={handleSave}
            disabled={loading || !content.trim()}
            className="bg-primary-400 text-white text-sm font-medium px-4 py-2
              rounded-xl transition-all active:scale-95 hover:bg-primary-500
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Saving…" : entry ? "Update" : "Save"}
          </button>
        </div>
      </div>

      {/* Date */}
      <div className="px-5 mb-4">
        <p className="text-xs text-slate-400 font-medium">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Mood selector */}
      <div className="px-5 mb-4">
        <p className="text-xs font-medium text-slate-500 mb-2">
          How are you feeling?
        </p>
        <div className="flex gap-2">
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMood(mood === m.id ? null : m.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border
                transition-all duration-200 active:scale-95
                ${
                  mood === m.id
                    ? MOOD_COLORS[m.id]
                    : "border-slate-100 bg-white text-slate-400 hover:border-primary-200"
                }`}
            >
              {m.icon}
              <span className="text-[9px] font-medium">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Text area */}
      <div className="px-5 flex-1 flex flex-col">
        <textarea
          ref={textRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind today? This is your safe space — write freely."
          className="flex-1 w-full bg-transparent text-slate-700 text-sm leading-relaxed
            placeholder-slate-300 resize-none focus:outline-none min-h-[300px]"
        />
        <p className="text-xs text-slate-300 dark:text-slate-600 text-right py-3">
          {wordCount} word{wordCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50 animate-fade-in">
          <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-800 rounded-t-3xl p-6 animate-slide-up">
            <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 mb-2">
              Delete this entry?
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="lg"
                className="flex-1"
                onClick={() => setDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="lg"
                className="flex-1"
                loading={deleting}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Journal Page ──────────────────────────────────────────────
export default function Journal() {
  const { session, profile, updateProfile } = useApp();
  const toast = useToast();

  const [screen, setScreen] = useState("lock"); // lock | setup | list | write
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [editingEntry, setEditingEntry] = useState(null);

  const hasPin = !!profile?.journal_pin;

  // Determine initial screen
  useEffect(() => {
    if (!hasPin) setScreen("setup");
    else setScreen("lock");
  }, [hasPin]);

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setEntries(data || []);
    setLoading(false);
  };

  // PIN setup
  const handleSetupPin = async (pin) => {
    const { error } = await updateProfile({ journal_pin: pin });
    if (error) {
      toast("Could not set PIN", "error");
      return;
    }
    toast("PIN set successfully", "success");
    setScreen("list");
    fetchEntries();
  };

  // PIN unlock
  const handleUnlock = (entered) => {
    if (entered === profile?.journal_pin) {
      setScreen("list");
      fetchEntries();
    } else {
      toast("Incorrect PIN", "error");
    }
  };

  // Save entry
  const handleSave = async ({ content, mood }) => {
    if (editingEntry) {
      const { data, error } = await supabase
        .from("journal_entries")
        .update({ content, mood })
        .eq("id", editingEntry.id)
        .select()
        .single();
      if (error) {
        toast("Could not update entry", "error");
        return;
      }
      setEntries((prev) => prev.map((e) => (e.id === data.id ? data : e)));
      toast("Entry updated", "success");
    } else {
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({ content, mood, user_id: session.user.id })
        .select()
        .single();
      if (error) {
        toast("Could not save entry", "error");
        return;
      }
      setEntries((prev) => [data, ...prev]);
      toast("Entry saved", "success");
    }
    setEditingEntry(null);
    setScreen("list");
  };

  // Delete entry
  const handleDelete = async (id) => {
    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", id);
    if (error) {
      toast("Could not delete entry", "error");
      return;
    }
    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast("Entry deleted", "success");
    setScreen("list");
    setEditingEntry(null);
  };

  const filtered = entries.filter((e) =>
    e.content.toLowerCase().includes(search.toLowerCase())
  );

  // ── Screens ──
  if (screen === "setup") {
    return (
      <PinPad
        title="Set a journal PIN"
        subtitle="Protect your journal with a 4-digit PIN"
        confirmMode
        onComplete={handleSetupPin}
      />
    );
  }

  if (screen === "lock") {
    return (
      <PinPad
        title="Your journal"
        subtitle="Enter your PIN to continue"
        onComplete={handleUnlock}
      />
    );
  }

  if (screen === "write") {
    return (
      <WriteEntry
        entry={editingEntry}
        onSave={handleSave}
        onDelete={handleDelete}
        onBack={() => {
          setScreen("list");
          setEditingEntry(null);
        }}
      />
    );
  }

  // ── List screen ──
  return (
    <div className="min-h-screen bg-surface dark:bg-slate-900">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display text-xl font-bold text-slate-800">
              Journal
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Lock button */}
            <button
              onClick={() => setScreen("lock")}
              className="w-9 h-9 rounded-2xl bg-white border border-slate-100 shadow-card
                flex items-center justify-center text-slate-400
                hover:text-primary-400 hover:border-primary-200 transition-all"
            >
              <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </button>
            {/* New entry */}
            <button
              onClick={() => {
                setEditingEntry(null);
                setScreen("write");
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
        </div>

        {/* Search */}
        {entries.length > 0 && (
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search entries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 text-sm dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
        )}
      </div>

      {/* Entry list */}
      <div className="px-5 pb-8 flex flex-col gap-3">
        {loading && (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        )}

        {!loading && error && (
          <ErrorState description={error} onRetry={fetchEntries} />
        )}

        {!loading && !error && entries.length === 0 && (
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            }
            title="Your journal is empty"
            description="Write your first entry. This is your private space — no one else can read it."
            action={
              <Button size="sm" onClick={() => setScreen("write")}>
                Write your first entry
              </Button>
            }
          />
        )}

        {!loading && !error && entries.length > 0 && filtered.length === 0 && (
          <EmptyState
            icon="🔍"
            title="No entries found"
            description={`Nothing matches "${search}"`}
          />
        )}

        {!loading &&
          !error &&
          filtered.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onClick={() => {
                setEditingEntry(entry);
                setScreen("write");
              }}
            />
          ))}
      </div>
    </div>
  );
}
