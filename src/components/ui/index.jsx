import { forwardRef } from "react";

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  loading,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl";
  const variants = {
    primary: "bg-primary-400 text-white hover:bg-primary-500 shadow-soft",
    ghost:
      "bg-transparent text-primary-400 hover:bg-primary-50 border border-primary-200",
    danger: "bg-red-500 text-white hover:bg-red-600",
    subtle: "bg-primary-50 text-primary-600 hover:bg-primary-100",
  };
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base w-full",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

export const Input = forwardRef(function Input(
  { label, error, className = "", ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-600 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`input ${
          error ? "border-red-400 focus:ring-red-400" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, error, className = "", ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-600 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`input resize-none ${
          error ? "border-red-400 focus:ring-red-400" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
});

export function Card({ className = "", children, onClick, ...props }) {
  return (
    <div
      className={`card ${
        onClick
          ? "cursor-pointer hover:shadow-glow transition-shadow duration-200"
          : ""
      } ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function Spinner({ size = "md", className = "" }) {
  const sizes = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
  return (
    <svg
      className={`animate-spin text-primary-400 ${sizes[size]} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export function PageLoader() {
  return (
    <div className="page-container flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <Spinner size="lg" />
        <p className="text-sm text-slate-400">Loading Cerebra…</p>
      </div>
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse bg-primary-50 rounded-2xl ${className}`} />
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4 text-2xl">
          {icon}
        </div>
      )}
      <h3 className="font-display font-semibold text-slate-700 text-lg mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 text-2xl">
        ⚠️
      </div>
      <h3 className="font-display font-semibold text-slate-700 text-lg mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 text-sm text-primary-400 font-medium"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function Badge({ children, variant = "primary", className = "" }) {
  const variants = {
    primary: "bg-primary-50 text-primary-600",
    success: "bg-teal-50 text-teal-600",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-red-50 text-red-600",
    neutral: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2
        ${checked ? "bg-primary-400" : "bg-slate-200"} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm
        transform transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function Divider({ label, className = "" }) {
  if (!label) return <hr className={`border-slate-100 ${className}`} />;
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <hr className="flex-1 border-slate-100" />
      <span className="text-xs text-slate-400">{label}</span>
      <hr className="flex-1 border-slate-100" />
    </div>
  );
}
