import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  {
    to: "/app/home",
    label: "Home",
    icon: (a) => (
      <svg
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={a ? 2.2 : 1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    to: "/app/tasks",
    label: "Tasks",
    icon: (a) => (
      <svg
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={a ? 2.2 : 1.8}
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
    to: "/app/journal",
    label: "Journal",
    icon: (a) => (
      <svg
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={a ? 2.2 : 1.8}
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
    to: "/app/more",
    label: "More",
    icon: (a) => (
      <svg
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={a ? 2.2 : 1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    ),
  },
];

export default function AppLayout({ children }) {
  const location = useLocation();
  return (
    <div className="page-container">
      <main className="bottom-nav-height overflow-y-auto scrollbar-hide">
        {children}
      </main>
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md
        bg-white/90 backdrop-blur-md border-t border-slate-100 z-40"
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ to, label, icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all duration-200 min-w-[60px]"
              >
                <span
                  className={`transition-colors duration-200 ${
                    active ? "text-primary-400" : "text-slate-400"
                  }`}
                >
                  {icon(active)}
                </span>
                <span
                  className={`text-[10px] font-medium transition-colors duration-200
                  ${active ? "text-primary-400" : "text-slate-400"}`}
                >
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
