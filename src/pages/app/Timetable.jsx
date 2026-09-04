import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import {
  Button,
  Input,
  Card,
  EmptyState,
  Spinner,
  ErrorState,
} from "../../components/ui/index";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function timeRange(entry) {
  return entry.end_time
    ? `${formatTime(entry.start_time)} – ${formatTime(entry.end_time)}`
    : formatTime(entry.start_time);
}

function bucketFor(startTime) {
  const hour = parseInt(startTime.split(":")[0], 10);
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Night";
}

const BUCKETS = ["Morning", "Afternoon", "Night"];

/* ---------------------------------------------------------- */
/* Step 1 — create timetable: title + type                     */
/* ---------------------------------------------------------- */
function CreateTimetable({ session, onCreated, onCancel, toast }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast("Give your timetable a name", "error");
      return;
    }
    if (!type) {
      toast("Choose a timetable type", "error");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("timetables")
      .insert({ user_id: session.user.id, title: title.trim(), type })
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast("Could not create timetable", "error");
      return;
    }
    onCreated(data);
  };

  return (
    <div className="px-5 pt-6 pb-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display text-xl font-bold text-slate-800 dark:text-white">
          New timetable
        </h1>
      </div>

      <Input
        label="Name"
        placeholder="e.g. Fall semester, My daily routine"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-6"
      />

      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
        Type
      </p>
      <div className="flex flex-col gap-3 mb-8">
        <button
          onClick={() => setType("standard")}
          className={`text-left p-4 rounded-2xl border-2 transition-all
            ${
              type === "standard"
                ? "border-primary-400 bg-primary-50 dark:bg-primary-900/20"
                : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800"
            }`}
        >
          <p className="font-display font-semibold text-slate-800 dark:text-white text-sm mb-1">
            Standard
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            A course-style weekly schedule. Browse by day, add classes as you go.
          </p>
        </button>
        <button
          onClick={() => setType("personal")}
          className={`text-left p-4 rounded-2xl border-2 transition-all
            ${
              type === "personal"
                ? "border-primary-400 bg-primary-50 dark:bg-primary-900/20"
                : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800"
            }`}
        >
          <p className="font-display font-semibold text-slate-800 dark:text-white text-sm mb-1">
            Personal
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Build your week day-by-day, then see it all laid out by morning,
            afternoon, and night.
          </p>
        </button>
      </div>

      <Button size="lg" loading={saving} onClick={handleCreate}>
        Continue
      </Button>
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Inline add-entry form, shared by standard + personal        */
/* ---------------------------------------------------------- */
function AddEntryForm({ onAdd, showLocation = false }) {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("");
  const [open, setOpen] = useState(false);

  const submit = async () => {
    if (!title.trim() || !start) return;
    await onAdd({
      title: title.trim(),
      start_time: start,
      end_time: end || null,
      location: showLocation ? location.trim() || null : null,
    });
    setTitle("");
    setStart("");
    setEnd("");
    setLocation("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700
          text-sm font-medium text-primary-400 hover:border-primary-300 transition-all"
      >
        + Add entry
      </button>
    );
  }

  return (
    <Card className="!p-4 mb-3">
      <Input
        placeholder="Title (e.g. CSC 301, Study block)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-3"
      />
      {showLocation && (
        <Input
          placeholder="Location (optional)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="mb-3"
        />
      )}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Start
          </label>
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="input py-2.5"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            End (optional)
          </label>
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="input py-2.5"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" className="flex-1" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button size="sm" className="flex-1" onClick={submit}>
          Add
        </Button>
      </div>
    </Card>
  );
}

function EntryRow({ entry, onDelete }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 mb-2">
      <div>
        <p className="font-display font-semibold text-slate-800 dark:text-white text-sm">
          {entry.title}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {timeRange(entry)}
          {entry.location ? ` · ${entry.location}` : ""}
        </p>
      </div>
      <button
        onClick={() => onDelete(entry.id)}
        className="text-slate-300 hover:text-red-400 transition-colors p-1"
        aria-label="Delete entry"
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Standard timetable — day tabs, immediate CRUD                */
/* ---------------------------------------------------------- */
function StandardTimetable({ timetableId, entries, onEntriesChanged, onBack, toast }) {
  const [activeDay, setActiveDay] = useState(new Date().getDay());

  const dayEntries = entries
    .filter((e) => e.day_of_week === activeDay)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const handleAdd = async (form) => {
    const { data, error } = await supabase
      .from("timetable_entries")
      .insert({ ...form, timetable_id: timetableId, day_of_week: activeDay })
      .select()
      .single();
    if (error) {
      toast("Could not add entry", "error");
      return;
    }
    onEntriesChanged([...entries, data]);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("timetable_entries").delete().eq("id", id);
    if (error) {
      toast("Could not delete entry", "error");
      return;
    }
    onEntriesChanged(entries.filter((e) => e.id !== id));
  };

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-4">
        {DAYS_SHORT.map((d, i) => (
          <button
            key={d}
            onClick={() => setActiveDay(i)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all
              ${
                activeDay === i
                  ? "bg-primary-400 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700"
              }`}
          >
            {d}
          </button>
        ))}
      </div>

      {dayEntries.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">
          Nothing scheduled for {DAYS[activeDay]} yet.
        </p>
      ) : (
        dayEntries.map((entry) => (
          <EntryRow key={entry.id} entry={entry} onDelete={handleDelete} />
        ))
      )}

      <AddEntryForm onAdd={handleAdd} showLocation />

      <button
        onClick={onBack}
        className="w-full mt-6 text-sm font-medium text-slate-400 dark:text-slate-500"
      >
        Done
      </button>
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Personal wizard — walk through all 7 days, then reveal       */
/* ---------------------------------------------------------- */
function PersonalWizard({ timetableId, onFinish, toast }) {
  const [dayIndex, setDayIndex] = useState(0);
  const [entriesByDay, setEntriesByDay] = useState(() =>
    Array.from({ length: 7 }, () => [])
  );

  const handleAdd = async (form) => {
    const { data, error } = await supabase
      .from("timetable_entries")
      .insert({ ...form, timetable_id: timetableId, day_of_week: dayIndex })
      .select()
      .single();
    if (error) {
      toast("Could not add entry", "error");
      return;
    }
    setEntriesByDay((prev) => {
      const next = [...prev];
      next[dayIndex] = [...next[dayIndex], data];
      return next;
    });
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("timetable_entries").delete().eq("id", id);
    if (error) {
      toast("Could not delete entry", "error");
      return;
    }
    setEntriesByDay((prev) => {
      const next = [...prev];
      next[dayIndex] = next[dayIndex].filter((e) => e.id !== id);
      return next;
    });
  };

  const isLastDay = dayIndex === 6;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-lg font-bold text-slate-800 dark:text-white">
          {DAYS[dayIndex]}
        </h2>
        <span className="text-xs text-slate-400">{dayIndex + 1} of 7</span>
      </div>
      <div className="flex gap-1 mb-6">
        {DAYS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i <= dayIndex ? "bg-primary-400" : "bg-slate-100 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>

      {entriesByDay[dayIndex]
        .slice()
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
        .map((entry) => (
          <EntryRow key={entry.id} entry={entry} onDelete={handleDelete} />
        ))}

      <AddEntryForm onAdd={handleAdd} />

      <div className="flex gap-3 mt-6">
        {dayIndex > 0 && (
          <Button variant="ghost" className="flex-1" onClick={() => setDayIndex((d) => d - 1)}>
            Back
          </Button>
        )}
        <Button
          className="flex-1"
          onClick={() =>
            isLastDay ? onFinish() : setDayIndex((d) => Math.min(6, d + 1))
          }
        >
          {isLastDay ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Personal — single-day editor (used when revisiting a day)    */
/* ---------------------------------------------------------- */
function PersonalDayEditor({ timetableId, day, entries, onEntriesChanged, onBack, toast }) {
  const dayEntries = entries
    .filter((e) => e.day_of_week === day)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const handleAdd = async (form) => {
    const { data, error } = await supabase
      .from("timetable_entries")
      .insert({ ...form, timetable_id: timetableId, day_of_week: day })
      .select()
      .single();
    if (error) {
      toast("Could not add entry", "error");
      return;
    }
    onEntriesChanged([...entries, data]);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("timetable_entries").delete().eq("id", id);
    if (error) {
      toast("Could not delete entry", "error");
      return;
    }
    onEntriesChanged(entries.filter((e) => e.id !== id));
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="font-display text-lg font-bold text-slate-800 dark:text-white">
          {DAYS[day]}
        </h2>
      </div>

      {dayEntries.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">
          Nothing added for {DAYS[day]} yet.
        </p>
      ) : (
        dayEntries.map((entry) => (
          <EntryRow key={entry.id} entry={entry} onDelete={handleDelete} />
        ))
      )}

      <AddEntryForm onAdd={handleAdd} />

      <Button className="w-full mt-6" onClick={onBack}>
        Done
      </Button>
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Personal overview — the final Morning/Afternoon/Night card   */
/* ---------------------------------------------------------- */
function PersonalOverview({ entries, onEditDay }) {
  const hasAny = entries.length > 0;

  return (
    <div>
      {!hasAny && (
        <p className="text-sm text-slate-400 text-center py-6">
          This timetable is empty. Tap a day below to start adding to it.
        </p>
      )}
      {DAYS.map((dayName, dayIndex) => {
        const dayEntries = entries.filter((e) => e.day_of_week === dayIndex);
        return (
          <Card
            key={dayIndex}
            className="mb-3 !p-4 cursor-pointer"
            onClick={() => onEditDay(dayIndex)}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-display font-semibold text-slate-800 dark:text-white text-sm">
                {dayName}
              </p>
              <span className="text-xs text-primary-400 font-medium">Edit</span>
            </div>
            {dayEntries.length === 0 ? (
              <p className="text-xs text-slate-400">Nothing scheduled</p>
            ) : (
              BUCKETS.map((bucket) => {
                const bucketEntries = dayEntries
                  .filter((e) => bucketFor(e.start_time) === bucket)
                  .sort((a, b) => a.start_time.localeCompare(b.start_time));
                if (bucketEntries.length === 0) return null;
                return (
                  <div key={bucket} className="mb-2 last:mb-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                      {bucket}
                    </p>
                    {bucketEntries.map((entry) => (
                      <div key={entry.id} className="flex items-baseline justify-between text-xs mb-0.5">
                        <span className="text-slate-600 dark:text-slate-300">{entry.title}</span>
                        <span className="text-slate-400 shrink-0 ml-2">{timeRange(entry)}</span>
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </Card>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Root page                                                    */
/* ---------------------------------------------------------- */
export default function Timetable() {
  const { session } = useApp();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timetables, setTimetables] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [screen, setScreen] = useState("view"); // view | create | wizard | day-edit
  const [editDay, setEditDay] = useState(null);

  const fetchTimetables = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("timetables")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: true });
    if (error) {
      setError(error.message);
    } else {
      setTimetables(data || []);
      if ((data || []).length > 0) {
        setActiveId((prev) => prev || data[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTimetables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.user.id]);

  const fetchEntries = async (timetableId) => {
    setEntriesLoading(true);
    const { data, error } = await supabase
      .from("timetable_entries")
      .select("*")
      .eq("timetable_id", timetableId);
    if (!error) setEntries(data || []);
    setEntriesLoading(false);
  };

  useEffect(() => {
    if (activeId) fetchEntries(activeId);
  }, [activeId]);

  const activeTimetable = timetables.find((t) => t.id === activeId);

  const handleCreated = (newTimetable) => {
    setTimetables((prev) => [...prev, newTimetable]);
    setActiveId(newTimetable.id);
    setEntries([]);
    setScreen(newTimetable.type === "personal" ? "wizard" : "view");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState description={error} onRetry={fetchTimetables} />;
  }

  if (screen === "create") {
    return (
      <CreateTimetable
        session={session}
        onCreated={handleCreated}
        onCancel={() => setScreen("view")}
        toast={toast}
      />
    );
  }

  if (screen === "wizard" && activeTimetable) {
    return (
      <div className="px-5 pt-6 pb-8">
        <PersonalWizard
          timetableId={activeTimetable.id}
          onFinish={() => {
            setScreen("view");
            fetchEntries(activeTimetable.id);
            toast("Timetable ready", "success");
          }}
          toast={toast}
        />
      </div>
    );
  }

  if (screen === "day-edit" && activeTimetable) {
    return (
      <div className="px-5 pt-6 pb-8">
        <PersonalDayEditor
          timetableId={activeTimetable.id}
          day={editDay}
          entries={entries}
          onEntriesChanged={setEntries}
          onBack={() => setScreen("view")}
          toast={toast}
        />
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-xl font-bold text-slate-800 dark:text-white">
          Timetable
        </h1>
        <button onClick={() => setScreen("create")} className="text-sm font-medium text-primary-400">
          + New
        </button>
      </div>

      {timetables.length === 0 ? (
        <EmptyState
          icon="🗓️"
          title="No timetable yet"
          description="Build a standard course schedule, or a personal day-by-day plan."
          action={<Button onClick={() => setScreen("create")}>Create timetable</Button>}
        />
      ) : (
        <>
          {timetables.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-4">
              {timetables.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveId(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all
                    ${
                      activeId === t.id
                        ? "bg-primary-400 text-white"
                        : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700"
                    }`}
                >
                  {t.title}
                </button>
              ))}
            </div>
          )}

          {entriesLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner />
            </div>
          ) : activeTimetable?.type === "personal" ? (
            <PersonalOverview
              entries={entries}
              onEditDay={(day) => {
                setEditDay(day);
                setScreen("day-edit");
              }}
            />
          ) : activeTimetable ? (
            <StandardTimetable
              timetableId={activeTimetable.id}
              entries={entries}
              onEntriesChanged={setEntries}
              onBack={() => {}}
              toast={toast}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
