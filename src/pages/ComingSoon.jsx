import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/ui/index";

const featureInfo = {
  timetable: {
    emoji: "📅",
    title: "Timetable Planner",
    desc: "Plan your weekly schedule, set class reminders, and never miss a lecture.",
  },
  quiz: {
    emoji: "🧠",
    title: "AI Quiz Generator",
    desc: "Upload your study material and let AI generate practice questions for you.",
  },
  flashcards: {
    emoji: "🃏",
    title: "Flashcards",
    desc: "Create and review flashcards built from your own documents.",
  },
  documents: {
    emoji: "📄",
    title: "Document Upload",
    desc: "Upload lecture notes and textbooks to power your AI study tools.",
  },
  "peer-chat": {
    emoji: "💬",
    title: "Peer Support Chat",
    desc: "Connect anonymously with other students who understand what you're going through.",
  },
  counselor: {
    emoji: "🤝",
    title: "Counselor Booking",
    desc: "Book a session with a professional counselor directly from the app.",
  },
};

export default function ComingSoon({ feature }) {
  const { session } = useApp();
  const toast = useToast();
  const [notified, setNotified] = useState(false);
  const [loading, setLoading] = useState(false);
  const info = featureInfo[feature] || {
    emoji: "🚀",
    title: "Coming Soon",
    desc: "This feature is on its way.",
  };

  const handleNotify = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    const { error } = await supabase
      .from("notify_requests")
      .upsert(
        { user_id: session.user.id, feature_slug: feature },
        { onConflict: "user_id,feature_slug" }
      );
    setLoading(false);
    if (error) {
      toast("Something went wrong. Try again.", "error");
    } else {
      setNotified(true);
      toast("We'll let you know when it's ready!", "success");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-3xl bg-primary-50 flex items-center justify-center text-4xl mb-6">
        {info.emoji}
      </div>
      <span
        className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 text-xs font-medium
        px-3 py-1.5 rounded-full mb-4"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Coming soon
      </span>
      <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white mb-3">
        {info.title}
      </h1>
      <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-8">
        {info.desc}
      </p>

      {notified ? (
        <div className="flex items-center gap-2 text-teal-500 font-medium text-sm">
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
              d="M5 13l4 4L19 7"
            />
          </svg>
          You're on the list!
        </div>
      ) : (
        <Button onClick={handleNotify} loading={loading} size="lg">
          Notify me when it's ready
        </Button>
      )}

      <Link
        to="/app/home"
        className="mt-6 text-sm text-slate-400 hover:text-primary-400 transition-colors duration-200"
      >
        ← Back to home
      </Link>
    </div>
  );
}
