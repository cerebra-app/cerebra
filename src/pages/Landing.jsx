import { Link } from "react-router-dom";
import { CerebraLockup } from "../components/ui/Logo";
import { Button } from "../components/ui/index";

const features = [
  {
    emoji: "🧠",
    title: "Stay on track",
    desc: "Streak calendar and task manager built for student life.",
  },
  {
    emoji: "🌿",
    title: "Find your calm",
    desc: "Guided breathing and mindfulness sessions, anytime.",
  },
  {
    emoji: "📓",
    title: "Private journal",
    desc: "PIN-protected daily journal. Your thoughts, safely yours.",
  },
  {
    emoji: "💬",
    title: "Real support",
    desc: "Access counselors and peer support when you need it most.",
  },
];

export default function Landing() {
  return (
    <div className="page-container overflow-y-auto scrollbar-hide">
      <header className="flex items-center justify-between px-6 py-5">
        <CerebraLockup height={32} />
        <Link to="/login">
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
        </Link>
      </header>

      <section className="px-6 pt-8 pb-12 text-center animate-fade-in">
        <div
          className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 text-xs
          font-medium px-3 py-1.5 rounded-full mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse-soft" />
          Built for university students
        </div>
        <h1 className="font-display text-4xl font-bold text-slate-800 leading-tight mb-4">
          Your mind,
          <br />
          <span className="text-primary-400">balanced.</span>
        </h1>
        <p className="text-slate-500 text-base leading-relaxed max-w-xs mx-auto mb-8">
          Cerebra helps you manage your academic life, mental wellbeing, and
          daily habits — all in one calm space.
        </p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Link to="/signup">
            <Button size="lg">Get started — it's free</Button>
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
              className="card animate-slide-up"
              style={{
                animationDelay: `${i * 0.08}s`,
                animationFillMode: "both",
              }}
            >
              <span className="text-2xl mb-2 block">{f.emoji}</span>
              <h3 className="font-display text-sm font-semibold text-slate-700 mb-1">
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
          <a href="#" className="text-primary-400 underline underline-offset-2">
            Terms
          </a>
          {" & "}
          <a href="#" className="text-primary-400 underline underline-offset-2">
            Privacy Policy
          </a>
        </p>
      </footer>
    </div>
  );
}
