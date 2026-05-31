import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { CerebraLockup } from "../../components/ui/Logo";
import { Button, Input, PasswordInput } from "../../components/ui/index";
import { useToast } from "../../context/ToastContext";

export default function ResetPassword() {
  const navigate = useNavigate();
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handle = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (password.length < 8) e.password = "At least 8 characters";
    if (password !== confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast(error.message, "error");
    } else {
      toast("Password updated successfully!", "success");
      navigate("/app/home");
    }
  };

  return (
    <div className="page-container min-h-screen flex flex-col px-6 safe-top">
      <div className="pt-5 pb-8" />
      <div className="flex-1 flex flex-col animate-slide-up">
        <CerebraLockup height={36} className="mb-8" />
        <h1 className="font-display text-2xl font-bold text-slate-800 mb-1">
          Set new password
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          Choose a strong password for your account.
        </p>
        <form onSubmit={handle} className="flex flex-col gap-4">
          <PasswordInput
            label="New password"
            value={password}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
          <PasswordInput
            label="Confirm new password"
            value={password}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
          />
          <Button size="lg" loading={loading} type="submit" className="mt-2">
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
