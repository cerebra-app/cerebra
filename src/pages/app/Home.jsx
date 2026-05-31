import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { supabase } from "../../lib/supabase";
import { Card, Skeleton } from "../../components/ui/index";
import { CerebraWordmark } from "../../components/ui/Logo";
import { getDailyQuotes } from "../../lib/quotes";

// ── Quotes ──────────────────────────────────────────────────────
// const QUOTES = [
//   {
//     text: "You don't have to be perfect to be worthy of rest.",
//     author: "Unknown",
//   },
//   { text: "Progress, not perfection.", author: "Unknown" },
//   {
//     text: "Your mental health is a priority. Your happiness is essential.",
//     author: "Unknown",
//   },
//   {
//     text: "It's okay to not be okay — as long as you don't give up.",
//     author: "Unknown",
//   },
//   { text: "Small steps every day lead to big changes.", author: "Unknown" },
//   {
//     text: "Be gentle with yourself. You are a child of the universe.",
//     author: "Max Ehrmann",
//   },
//   {
//     text: "You are allowed to be both a masterpiece and a work in progress.",
//     author: "Sophia Bush",
//   },
//   {
//     text: "Difficult roads often lead to beautiful destinations.",
//     author: "Unknown",
//   },
//   {
//     text: "Breathe. You've survived 100% of your worst days.",
//     author: "Unknown",
//   },
//   {
//     text: "The secret of getting ahead is getting started.",
//     author: "Mark Twain",
//   },
//   { text: "You are stronger than you think.", author: "Unknown" },
//   { text: "Every expert was once a beginner.", author: "Unknown" },
//   { text: "One day at a time. One step at a time.", author: "Unknown" },
//   {
//     text: "Believe you can and you're halfway there.",
//     author: "Theodore Roosevelt",
//   },
//   {
//     text: "Don't compare your chapter 1 to someone else's chapter 20.",
//     author: "Unknown",
//   },
// ];

// function getDailyQuote() {
//   const day = new Date().getDate() + new Date().getMonth() * 31;
//   return QUOTES[day % QUOTES.length];
// }

// nudge for incomplete task
function UrgentTaskNudge({ userId }) {
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      // Check cooldown — only show if 30 mins have passed since last nudge
      const lastShown = sessionStorage.getItem("nudge_last_shown");
      if (lastShown) {
        const elapsed = Date.now() - parseInt(lastShown);
        const thirtyMins = 30 * 60 * 1000;
        if (elapsed < thirtyMins) return;
      }

      const today = new Date();
      const threeDaysLater = new Date();
      threeDaysLater.setDate(today.getDate() + 3);

      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .eq("is_completed", false)
        .eq("priority", "high")
        .lte("due_date", threeDaysLater.toISOString().split("T")[0])
        .not("due_date", "is", null)
        .order("due_date", { ascending: true })
        .limit(1);

      if (data && data.length > 0) {
        setTask(data[0]);
        setTimeout(() => {
          setVisible(true);
          // Record the time it was shown
          sessionStorage.setItem("nudge_last_shown", Date.now().toString());
        }, 1500);
      }
    };
    fetch();
  }, [userId]);

  const formatDue = (d) => {
    const due = new Date(d);
    const today = new Date(new Date().toDateString());
    const diff = Math.round((due - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Overdue";
    if (diff === 0) return "Due today";
    if (diff === 1) return "Due tomorrow";
    return `Due in ${diff} days`;
  };

  if (!task || dismissed) return null;

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-md
      z-40 transition-all duration-500 ease-out
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <div className="bg-slate-800 rounded-2xl p-4 shadow-glow flex items-start gap-3">
        {/* Urgency indicator */}
        <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#ef4444"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-red-400 mb-0.5">
            {formatDue(task.due_date)}
          </p>
          <p className="text-sm font-medium text-white truncate">
            {task.title}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            High priority · Needs your attention
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setDismissed(true);
              navigate("/app/tasks");
            }}
            className="text-xs font-medium text-primary-300 hover:text-primary-200 transition-colors"
          >
            View
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Profile
function Avatar({ name, imageUrl }) {
  const navigate = useNavigate();
  const { signOut } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate("/");
  };

  const menuItems = [
    {
      label: "Profile",
      icon: (
        <svg
          width="16"
          height="16"
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
      action: () => {
        setOpen(false);
        navigate("/app/settings?tab=profile");
      },
    },
    {
      label: "Settings",
      icon: (
        <svg
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      action: () => {
        setOpen(false);
        navigate("/app/settings?tab=appearance");
      },
    },
    {
      label: "Sign out",
      icon: (
        <svg
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      ),
      action: handleSignOut,
      danger: true,
    },
  ];

  return (
    <div className="relative" ref={ref}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="shrink-0 transition-all active:scale-95 focus:outline-none
          focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 rounded-full"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="font-display font-semibold text-primary-500 text-sm">
              {initial}
            </span>
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-11 w-44 bg-white dark:bg-slate-800 rounded-2xl shadow-glow
  border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-slide-up"
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
              {name}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              Cerebra account
            </p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm
          transition-colors duration-150 text-left
          ${
            item.danger
              ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              : "text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-slate-700 hover:text-primary-600 dark:hover:text-primary-400"
          }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────
function IconTasks() {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  );
}
function IconJournal() {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
}
function IconQuiz() {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  );
}
function IconResources() {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
}
function IconSupport() {
  return (
    <svg
      width="22"
      height="22"
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
  );
}

// ── Quick Actions ──────────────────────────────────────────────────────

function QuotesCarousel({ quotes }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % quotes.length);
    }, 7000);
  }, [quotes.length]);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  const goTo = (i) => {
    setCurrent(i);
    startTimer();
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-primary-400">
      <div className="relative h-32 overflow-hidden">
        {quotes.map((q, i) => (
          <div
            key={i}
            className={`absolute inset-0 px-5 pt-5 pb-8 transition-all duration-500 ease-in-out
              ${
                i === current
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-full"
              }`}
          >
            <p className="text-white text-sm leading-relaxed mb-2">
              "{q.text}"
            </p>
            <p className="text-primary-100 text-xs font-medium">— {q.author}</p>
          </div>
        ))}
      </div>
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
        {quotes.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300
              ${
                i === current ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40"
              }`}
          />
        ))}
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { to: "/app/tasks", icon: <IconTasks />, label: "Tasks" },
    { to: "/app/journal", icon: <IconJournal />, label: "Journal" },
    { to: "/app/resources", icon: <IconResources />, label: "Resources" },
    { to: "/app/counselor", icon: <IconSupport />, label: "Support" },
  ];
  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((a) => (
        <Link
          key={a.to}
          to={a.to}
          className="flex flex-col items-center gap-2 bg-white dark:bg-slate-800 rounded-2xl p-3
    border border-slate-100 dark:border-slate-700 shadow-card hover:shadow-glow
    transition-all duration-200 active:scale-95 text-slate-500 dark:text-slate-400"
        >
          {a.icon}
          <span className="text-[10px] font-medium text-slate-500">
            {a.label}
          </span>
        </Link>
      ))}
    </div>
  );
}

// ── Streak Calendar ──────────────────────────────────────────────────────
function StreakCalendar({ userId }) {
  const [checkedDates, setCheckedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayStr = today.toISOString().split("T")[0];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = today.toLocaleString("default", { month: "long" });
  const hasCheckedToday = checkedDates.includes(todayStr);

  const streak = (() => {
    let count = 0;
    const d = new Date(today);
    while (true) {
      const s = d.toISOString().split("T")[0];
      if (checkedDates.includes(s)) {
        count++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return count;
  })();

  useEffect(() => {
    const fetch = async () => {
      const startOfMonth = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const { data } = await supabase
        .from("streaks")
        .select("checked_in_date")
        .eq("user_id", userId)
        .gte("checked_in_date", startOfMonth);
      setCheckedDates(data?.map((r) => r.checked_in_date) || []);
      setLoading(false);
    };
    fetch();
  }, [userId, year, month]);

  const checkIn = async () => {
    if (hasCheckedToday || checkingIn) return;
    setCheckingIn(true);
    const { error } = await supabase
      .from("streaks")
      .insert({ user_id: userId, checked_in_date: todayStr });
    if (!error) setCheckedDates((prev) => [...prev, todayStr]);
    setCheckingIn(false);
  };

  if (loading) return <Skeleton className="h-52 w-full" />;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-slate-700 text-sm">
            {monthName} {year}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {streak > 0 ? `🔥 ${streak} day streak` : "Start your streak today"}
          </p>
        </div>
        {hasCheckedToday ? (
          <span className="text-xs bg-teal-50 text-teal-600 px-3 py-1.5 rounded-xl font-medium">
            ✓ Done today
          </span>
        ) : (
          <button
            onClick={checkIn}
            disabled={checkingIn}
            className="text-xs bg-primary-400 text-white px-3 py-1.5 rounded-xl
              font-medium transition-all active:scale-95 disabled:opacity-50"
          >
            {checkingIn ? "..." : "Check in"}
          </button>
        )}
      </div>
      <div className="grid grid-cols-7 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] text-slate-400 font-medium py-1"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(
            2,
            "0"
          )}-${String(day).padStart(2, "0")}`;
          const isToday = dateStr === todayStr;
          const isChecked = checkedDates.includes(dateStr);
          const isPast = new Date(dateStr) < today && !isToday;
          return (
            <div
              key={day}
              className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium
              ${isChecked ? "bg-primary-400 text-white" : ""}
              ${
                isToday && !isChecked
                  ? "border-2 border-primary-400 text-primary-400"
                  : ""
              }
              ${!isChecked && !isToday ? "text-slate-500" : ""}
              ${isPast && !isChecked ? "opacity-30" : ""}`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Breathing Exercise ──────────────────────────────────────────────────────
const PHASE_CONFIG = {
  inhale: {
    label: "Inhale",
    duration: 4,
    next: "hold",
    instruction: "Breathe in slowly through your nose",
  },
  hold: {
    label: "Hold",
    duration: 4,
    next: "exhale",
    instruction: "Hold gently — stay relaxed",
  },
  exhale: {
    label: "Exhale",
    duration: 6,
    next: "inhale",
    instruction: "Breathe out slowly through your mouth",
  },
};

// const SESSION_DURATION = 5 * 60;  5 minutes in seconds

function BreathingCard({ duration = 5 }) {
  const SESSION_DURATION = duration * 60;
  const [status, setStatus] = useState("idle"); // idle | running | done
  const [phase, setPhase] = useState("inhale");
  const [phaseCount, setPhaseCount] = useState(PHASE_CONFIG.inhale.duration);
  const [sessionLeft, setSessionLeft] = useState(SESSION_DURATION);
  const [cycles, setCycles] = useState(0);

  const phaseRef = useRef(phase);
  const phaseCountRef = useRef(phaseCount);
  const sessionRef = useRef(sessionLeft);
  phaseRef.current = phase;
  phaseCountRef.current = phaseCount;
  sessionRef.current = sessionLeft;

  useEffect(() => {
    if (status !== "running") return;

    const tick = setInterval(() => {
      // Session countdown
      const newSession = sessionRef.current - 1;
      if (newSession <= 0) {
        setStatus("done");
        setSessionLeft(0);
        clearInterval(tick);
        return;
      }
      setSessionLeft(newSession);

      // Phase countdown
      const newPhaseCount = phaseCountRef.current - 1;
      if (newPhaseCount <= 0) {
        const currentPhase = phaseRef.current;
        const nextPhase = PHASE_CONFIG[currentPhase].next;
        if (nextPhase === "inhale") setCycles((c) => c + 1);
        setPhase(nextPhase);
        setPhaseCount(PHASE_CONFIG[nextPhase].duration);
      } else {
        setPhaseCount(newPhaseCount);
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [status]);

  const start = () => {
    setStatus("running");
    setPhase("inhale");
    setPhaseCount(PHASE_CONFIG.inhale.duration);
    setSessionLeft(SESSION_DURATION);
    setCycles(0);
  };

  const reset = () => {
    setStatus("idle");
    setPhase("inhale");
    setPhaseCount(PHASE_CONFIG.inhale.duration);
    setSessionLeft(SESSION_DURATION);
    setCycles(0);
  };

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  // Progress ring
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const phaseDuration = PHASE_CONFIG[phase]?.duration || 4;
  const phaseProgress =
    status === "running" ? (phaseDuration - phaseCount) / phaseDuration : 0;
  const strokeDashoffset = circumference * (1 - phaseProgress);

  const ringColor = {
    inhale: "#7C6FF7",
    hold: "#4ECDC4",
    exhale: "#A090F9",
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-slate-700 text-sm">
            Guided Breathing
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            4-4-6 therapeutic breathing · {duration} min
          </p>
        </div>
        {status === "running" && (
          <span className="text-xs font-medium text-slate-500 tabular-nums">
            {formatTime(sessionLeft)}
          </span>
        )}
      </div>

      {/* Idle state */}
      {status === "idle" && (
        <div className="flex flex-col items-center py-4 gap-4">
          <div className="w-28 h-28 rounded-full bg-primary-50 flex items-center justify-center">
            <svg
              width="40"
              height="40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#7C6FF7"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v1m0 16v1m8.66-13l-.87.5M4.21 17.5l-.87.5M20.66 17.5l-.87-.5M4.21 6.5l-.87-.5M21 12h-1M4 12H3"
              />
              <circle cx="12" cy="12" r="4" strokeWidth={1.5} />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-600 font-medium mb-1">
              Ready to breathe?
            </p>
            <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">
              A {duration}-minute session to calm your nervous system and
              improve focus.
            </p>
          </div>
          <button
            onClick={start}
            className="bg-primary-400 text-white text-sm font-medium px-8 py-3 rounded-2xl
              transition-all active:scale-95 hover:bg-primary-500 shadow-soft"
          >
            Begin session
          </button>
        </div>
      )}

      {/* Running state */}
      {status === "running" && (
        <div className="flex flex-col items-center py-2 gap-3">
          {/* Progress ring */}
          <div className="relative w-32 h-32">
            <svg width="128" height="128" className="-rotate-90">
              <circle
                cx="64"
                cy="64"
                r={radius}
                fill="none"
                stroke="#F0EFFE"
                strokeWidth="8"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                fill="none"
                stroke={ringColor[phase]}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{
                  transition: "stroke-dashoffset 1s linear, stroke 0.5s ease",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-bold text-2xl text-slate-700">
                {phaseCount}
              </span>
              <span className="text-xs font-medium text-primary-400">
                {PHASE_CONFIG[phase].label}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center max-w-[200px] leading-relaxed">
            {PHASE_CONFIG[phase].instruction}
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>
              {cycles} cycle{cycles !== 1 ? "s" : ""} complete
            </span>
          </div>

          <button
            onClick={reset}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors mt-1"
          >
            End session
          </button>
        </div>
      )}

      {/* Done state */}
      {status === "done" && (
        <div className="flex flex-col items-center py-4 gap-3 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center">
            <svg
              width="28"
              height="28"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#4ECDC4"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-display font-semibold text-slate-700 mb-1">
              Session complete
            </p>
            <p className="text-xs text-slate-400 leading-relaxed max-w-[200px]">
              Well done. You completed {cycles} breathing cycle
              {cycles !== 1 ? "s" : ""}. Take a moment to notice how you feel.
            </p>
          </div>
          <button
            onClick={reset}
            className="text-sm text-primary-400 font-medium hover:text-primary-500 transition-colors"
          >
            Start another session
          </button>
        </div>
      )}
    </Card>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function Home() {
  const { profile, session } = useApp();
  const quotes = getDailyQuotes();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-slate-900">
      <div className="px-5 pt-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-slate-800">
            {greeting()}, {profile?.display_name || "Student"}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Avatar name={profile?.display_name} imageUrl={profile?.avatar_url} />
      </div>

      <div className="px-5 pb-8 flex flex-col gap-5">
        {profile?.show_quotes !== false && <QuotesCarousel quotes={quotes} />}

        <div>
          <h2 className="font-display text-sm font-semibold text-slate-600 mb-3">
            Quick access
          </h2>
          <QuickActions />
        </div>

        {profile?.show_streak !== false && session?.user?.id && (
          <div>
            <h2 className="font-display text-sm font-semibold text-slate-600 mb-3">
              Study streak
            </h2>
            <StreakCalendar userId={session.user.id} />
          </div>
        )}

        <div>
          <h2 className="font-display text-sm font-semibold text-slate-600 mb-3">
            Mindfulness
          </h2>
          <BreathingCard duration={profile?.mindfulness_duration || 5} />
        </div>
      </div>
      {session?.user?.id && <UrgentTaskNudge userId={session.user.id} />}
    </div>
  );
}
