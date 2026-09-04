import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { ThalaLockup } from "../../components/ui/Logo";
import { Button, Input, PasswordInput } from "../../components/ui/index";
import { useToast } from "../../context/ToastContext";

export default function Signup() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.username) e.username = "Username is required";
    else if (form.username.length < 3) e.username = "At least 3 characters";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username))
      e.username = "Letters, numbers and underscores only";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "At least 8 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const checkUsername = async (username) => {
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username.toLowerCase())
      .single();
    return !!data;
  };

  const handleSignup = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    // Check username availability
    const taken = await checkUsername(form.username);
    if (taken) {
      setErrors((prev) => ({ ...prev, username: "Username is already taken" }));
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/app/home`,
        data: { username: form.username.toLowerCase() },
      },
    });
    setLoading(false);
    if (error) {
      toast(error.message, "error");
    } else {
      // Create profile immediately so username is reserved
      if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          username: form.username.toLowerCase(),
          display_name: form.username,
          email: form.email.toLowerCase(),
          onboarding_complete: false,
        });
      }
      navigate("/onboarding");
    }
  };

  return (
    <div className="page-container full-height flex flex-col px-6 overflow-y-auto page-enter">
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
        <ThalaLockup height={36} className="mb-8" />
        <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white mb-1">
          Create your account
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          Join thousands of students on Thala
        </p>
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <Input
            label="University email"
            type="email"
            placeholder="you@university.edu"
            value={form.email}
            onChange={set("email")}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Username"
            type="text"
            placeholder="e.g. john_doe"
            value={form.username}
            onChange={set("username")}
            error={errors.username}
            autoComplete="username"
          />
          <PasswordInput
            label="Password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={set("password")}
            error={errors.password}
            autoComplete="new-password"
          />
          <PasswordInput
            label="Confirm password"
            placeholder="Repeat your password"
            value={form.confirm}
            onChange={set("confirm")}
            error={errors.confirm}
            autoComplete="new-password"
          />
          <Button size="lg" loading={loading} type="submit" className="mt-2">
            Create account
          </Button>
        </form>
        <p className="text-center text-sm text-slate-400 mt-8">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-400 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
