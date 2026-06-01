import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { CerebraLockup } from "../../components/ui/Logo";
import {
  Button,
  Input,
  Divider,
  PasswordInput,
} from "../../components/ui/index";
import { useToast } from "../../context/ToastContext";

const isEmail = (val) => /\S+@\S+\.\S+/.test(val);

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const [mode, setMode] = useState("password");
  const [identifier, setIdentifier] = useState(""); // email or username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!identifier) e.identifier = "Email or username is required";
    if (mode === "password" && !password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // If user typed a username, look up the email from profiles
  const resolveEmail = async (value) => {
    if (isEmail(value)) return value;
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", value.toLowerCase())
      .single();
    if (error || !data) return null;

    // Get email from auth.users via a Supabase RPC or admin —
    // instead we store email on profile at signup
    // For now return null and show helpful error
    return null;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    let email = identifier.trim();

    // Resolve username to email if needed
    if (!isEmail(email)) {
      const { data } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", email.toLowerCase())
        .single();

      if (!data?.email) {
        setErrors({ identifier: "No account found with that username" });
        setLoading(false);
        return;
      }
      email = data.email;
    }

    if (mode === "password") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) toast(error.message, "error");
      else navigate("/app/home");
    } else {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/app/home` },
      });
      setLoading(false);
      if (error) toast(error.message, "error");
      else setMagicSent(true);
    }
  };

  return (
    <div className="page-container flex flex-col px-6 overflow-y-auto page-enter">
      <div className="pt-5 pb-8">
        <Link
          to="/"
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
        <CerebraLockup height={36} className="mb-8" />
        <h1 className="font-display text-2xl font-bold text-slate-800 mb-1">
          Welcome back
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          Sign in to your Cerebra account
        </p>

        {magicSent ? (
          <div className="card text-center py-10 animate-fade-in">
            <div className="text-4xl mb-4">✉️</div>
            <h2 className="font-display font-semibold text-slate-700 mb-2">
              Check your email
            </h2>
            <p className="text-sm text-slate-400">
              We sent a login link to your email address.
            </p>
            <button
              onClick={() => {
                setMagicSent(false);
                setMode("password");
              }}
              className="mt-6 text-sm text-primary-400 font-medium"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Email or username"
                type="text"
                placeholder="you@university.edu or @username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                error={errors.identifier}
                autoComplete="username"
              />
              {mode === "password" && (
                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  autoComplete="current-password"
                />
              )}
              <div className="flex justify-end -mt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary-400"
                >
                  Forgot password?
                </Link>
              </div>
              <Button size="lg" loading={loading} type="submit">
                {mode === "password" ? "Sign in" : "Send magic link"}
              </Button>
            </form>

            <Divider label="or" className="my-6" />

            {mode === "password" ? (
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setMode("magic")}
              >
                ✨ Sign in with magic link
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setMode("password")}
              >
                Sign in with password instead
              </Button>
            )}
          </>
        )}

        <p className="text-center text-sm text-slate-400 mt-8">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary-400 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
