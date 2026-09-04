import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { ThalaLockup } from "../../components/ui/Logo";
import { Button, Input } from "../../components/ui/index";
import { useToast } from "../../context/ToastContext";

export default function ForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async (ev) => {
    ev.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (err) toast(err.message, "error");
    else setSent(true);
  };

  return (
    <div className="page-container full-height flex flex-col px-6 overflow-y-auto page-enter">
      <div className="pt-5 pb-8">
        <Link
          to="/login"
          className="text-slate-400 hover:text-primary-400 transition-colors"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
      </div>
      <div className="flex-1 flex flex-col animate-slide-up">
        <ThalaLockup height={36} className="mb-8" />
        {sent ? (
          <div className="card text-center py-10 animate-fade-in">
            <div className="text-4xl mb-4">📬</div>
            <h2 className="font-display font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Check your inbox
            </h2>
            <p className="text-sm text-slate-400">
              We sent a reset link to{" "}
              <strong className="text-slate-600">{email}</strong>
            </p>
            <Link
              to="/login"
              className="block mt-6 text-sm text-primary-400 font-medium"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white mb-1">
              Forgot password?
            </h1>
            <p className="text-slate-400 text-sm mb-8">
              Enter your email and we'll send a reset link.
            </p>
            <form onSubmit={handle} className="flex flex-col gap-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                error={error}
              />
              <Button size="lg" loading={loading} type="submit">
                Send reset link
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
