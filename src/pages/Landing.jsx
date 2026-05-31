import { Link } from "react-router-dom";
import { CerebraLockup } from "../components/ui/Logo";
import { Button } from "../components/ui/index";
import { useEffect, useState } from "react";

const features = [
  {
    title: "Stay on track",
    desc: "Streak calendar and task manager built for student life.",
    icon: (
      <svg
        width="24"
        height="24"
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
    ),
  },
  {
    title: "Find your calm",
    desc: "Guided breathing and mindfulness sessions, anytime.",
    icon: (
      <svg
        width="24"
        height="24"
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
  },
  {
    title: "Private journal",
    desc: "PIN-protected daily journal. Your thoughts, safely yours.",
    icon: (
      <svg
        width="24"
        height="24"
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
    ),
  },
  {
    title: "Real support",
    desc: "Access counselors and peer support when you need it most.",
    icon: (
      <svg
        width="24"
        height="24"
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
    ),
  },
];

function ThemeToggle() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const toggle = () => {
    const isDark = !dark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("cerebra_theme", isDark ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-xl flex items-center justify-center
        text-slate-400 hover:text-primary-400 hover:bg-primary-50
        dark:hover:bg-primary-900/20 transition-all"
    >
      {dark ? (
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
            d="M12 3v1m0 16v1m8.66-13l-.87.5M4.21 17.5l-.87.5M20.66 17.5l-.87-.5M4.21 6.5l-.87-.5M21 12h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"
          />
        </svg>
      ) : (
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
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}

export default function Landing() {
  return (
    <div className="page-container overflow-y-auto scrollbar-hide">
      <header className="flex items-center justify-between px-6 py-5">
        <CerebraLockup height={32} />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
        </div>
      </header>

      <section className="px-6 pt-8 pb-12 text-center animate-fade-in">
        <div
          className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 text-xs
          font-medium px-3 py-1.5 rounded-full mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse-soft" />
          Built for students
        </div>
        <h1 className="font-display text-4xl font-bold text-slate-800 leading-tight mb-4">
          Your mind,
          <br />
          <span className="text-primary-400">balanced.</span>
        </h1>
        <p className="text-slate-500 text-base leading-relaxed max-w-xs mx-auto mb-8">
          Cerebra helps you manage your academic life, mental wellbeing, and
          daily habits, all in one calm space.
        </p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Link to="/signup">
            <Button size="lg">Get started</Button>
            {/* Get started — it's free */}
          </Link>
          <Link to="/login">
            <Button size="lg" variant="ghost">
              I already have an account
            </Button>
          </Link>
        </div>
      </section>

      <section className="px-6 pb-16">
        <h2 className="font-display text-lg font-semibold text-slate-700 text-center mb-6">
          Everything you need, nothing you don't
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="card card-animate animate-slide-up"
              style={{
                animationDelay: `${i * 0.08}s`,
                animationFillMode: "both",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20
        flex items-center justify-center text-primary-400 mb-3"
              >
                {f.icon}
              </div>
              <h3
                className="font-display text-sm font-semibold text-slate-700
        dark:text-slate-200 mb-1"
              >
                {f.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-6 pb-8 text-center">
        <p className="text-xs text-slate-400">
          By signing up you agree to our{" "}
          <Link
            to="/terms"
            className="text-primary-400 underline underline-offset-2"
          >
            Terms of Use
          </Link>
          {" & "}
          <Link
            to="/privacy"
            className="text-primary-400 underline underline-offset-2"
          >
            Privacy Policy
          </Link>
        </p>
      </footer>
    </div>
  );
}
