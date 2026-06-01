import { useState } from "react";
import { RESOURCES } from "../../lib/resources";

export default function Resources() {
  const [search, setSearch] = useState("");

  const filtered = RESOURCES.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-slate-900 page-enter">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <h1 className="font-display text-xl font-bold text-slate-800">
          Free E-Resources
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {RESOURCES.length} curated resources for students
        </p>

        {/* Search */}
        <div className="relative mt-4">
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
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 text-sm"
          />
        </div>
      </div>

      {/* List */}
      <div className="px-5 pb-8 flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-14 h-14 rounded-full bg-primary-50 flex items-center
              justify-center mb-4 text-primary-400"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <p className="font-display font-semibold text-slate-700 mb-1">
              No results
            </p>
            <p className="text-sm text-slate-400">Nothing matches "{search}"</p>
          </div>
        )}

        {filtered.map((r) => (
          <div
            key={r.id}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 
    dark:border-slate-700 shadow-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {/* Favicon */}
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${
                      new URL(r.url).hostname
                    }&sz=16`}
                    alt=""
                    className="w-4 h-4 rounded-sm"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <h3 className="font-display font-semibold text-slate-700 dark:text-slate-200 text-sm">
                    {r.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed mb-3">
                  {r.description}
                </p>
                <p className="text-[10px] text-slate-300 dark:text-slate-600 truncate">
                  {new URL(r.url).hostname}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleOpen(r.url)}
              className="mt-3 w-full flex items-center justify-center gap-2
  bg-primary-50 dark:bg-primary-900/20 text-primary-500 dark:text-primary-400 
  text-xs font-medium py-2.5 rounded-xl transition-all active:scale-[0.99] 
  hover:bg-primary-100 dark:hover:bg-primary-900/30"
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
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Visit {r.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
