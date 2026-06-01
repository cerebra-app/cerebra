import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";

function MoreRow({ icon, label, to, badge, danger, onClick }) {
  const content = (
    <div
      className={`flex items-center gap-4 px-5 py-3.5 transition-colors duration-150
      ${
        danger
          ? "hover:bg-red-50 dark:hover:bg-red-900/20"
          : "hover:bg-primary-50 dark:hover:bg-slate-700"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
        ${
          danger
            ? "bg-red-50 dark:bg-red-900/20 text-red-400"
            : "bg-primary-50 dark:bg-primary-900/20 text-primary-400"
        }`}
      >
        {icon}
      </div>
      <span
        className={`flex-1 text-sm font-medium
        ${danger ? "text-red-500" : "text-slate-700 dark:text-slate-200"}`}
      >
        {label}
      </span>
      {badge && (
        <span
          className="text-[10px] font-medium bg-amber-50 text-amber-500
          px-2 py-0.5 rounded-full border border-amber-200"
        >
          {badge}
        </span>
      )}
      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        className="text-slate-300 dark:text-slate-600 shrink-0"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );

  if (onClick)
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  return <Link to={to}>{content}</Link>;
}

function SectionLabel({ label }) {
  return (
    <p className="px-5 pt-5 pb-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
      {label}
    </p>
  );
}

function Divider() {
  return <div className="h-px bg-slate-100 dark:bg-slate-700 mx-5" />;
}

export default function More() {
  const { profile, signOut } = useApp();
  const { toast } = useToast() || {};
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-surfacedark:bg-slate-900 page-enter">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <h1 className="font-display text-xl font-bold text-slate-800">More</h1>
      </div>

      {/* Profile card */}
      <div className="px-5 mb-4">
        <Link to="/app/settings">
          <div
            className="bg-primary-400 rounded-3xl p-5 flex items-center gap-4
            transition-all active:scale-[0.99] hover:bg-primary-500"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="font-display font-bold text-white text-lg">
                  {profile?.display_name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-white truncate">
                {profile?.display_name || "Student"}
              </p>
              <p className="text-primary-100 text-xs mt-0.5 truncate">
                @{profile?.username} ·{" "}
                {profile?.university || "University not set"}
              </p>
            </div>
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth={2}
              className="opacity-60 shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>
      </div>

      {/* Study tools */}
      <div
        className="bg-white dark:bg-slate-800 rounded-3xl mx-5 mb-3 overflow-hidden 
  border border-slate-100 dark:border-slate-700 shadow-card"
      >
        <MoreRow
          to="/app/resources"
          label="Free e-resources"
          icon={
            <svg
              width="18"
              height="18"
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
          }
        />
        <Divider />
        <MoreRow
          to="/app/documents"
          label="Document upload"
          //   badge="Coming soon"
          icon={
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />

        <Divider />
        <MoreRow
          to="/app/timetable"
          label="Timetable planner"
          badge="Coming soon"
          icon={
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />
        <Divider />
        <MoreRow
          to="/app/quiz"
          label="AI quiz generator"
          badge="Coming soon"
          icon={
            <svg
              width="18"
              height="18"
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
          }
        />
        <Divider />
        <MoreRow
          to="/app/flashcards"
          label="Flashcards"
          badge="Coming soon"
          icon={
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          }
        />
      </div>

      {/* Support */}
      <div
        className="bg-white dark:bg-slate-800 rounded-3xl mx-5 mb-3 overflow-hidden 
  border border-slate-100 dark:border-slate-700 shadow-card"
      >
        <SectionLabel label="Support" />
        <MoreRow
          to="/app/peer-chat"
          label="Peer support chat"
          badge="Coming soon"
          icon={
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
              />
            </svg>
          }
        />
        <Divider />
        <MoreRow
          to="/app/counselor"
          label="Book a counselor"
          badge="Coming soon"
          icon={
            <svg
              width="18"
              height="18"
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
          }
        />
      </div>

      {/* Account */}
      <div
        className="bg-white dark:bg-slate-800 rounded-3xl mx-5 mb-3 overflow-hidden 
  border border-slate-100 dark:border-slate-700 shadow-card"
      >
        <SectionLabel label="Account" />
        <MoreRow
          to="/app/settings"
          label="Settings"
          icon={
            <svg
              width="18"
              height="18"
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
          }
        />
        <Divider />
        <MoreRow
          label="Send feedback"
          onClick={() =>
            window.open(
              "mailto:mycerebra@gmail.com?subject=Cerebra Feedback",
              "_blank"
            )
          }
          icon={
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          }
        />
        <Divider />
        <MoreRow
          label="Sign out"
          danger
          onClick={handleSignOut}
          icon={
            <svg
              width="18"
              height="18"
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
          }
        />
      </div>

      {/* About */}
      <div className="px-5 py-6 text-center">
        <p className="text-xs text-slate-400">Cerebra · Version 1.0.0</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <Link
            to="/privacy"
            className="text-xs text-primary-400 underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          <span className="text-slate-300 text-xs">·</span>
          <Link
            to="/terms"
            className="text-xs text-primary-400 underline underline-offset-2"
          >
            Terms of Use
          </Link>
        </div>
      </div>
    </div>
  );
}
