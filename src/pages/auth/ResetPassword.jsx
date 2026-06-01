import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { CerebraLockup } from "../../components/ui/Logo";
import { Button, PasswordInput } from "../../components/ui/index";
import { useToast } from "../../context/ToastContext";

export default function ResetPassword() {
  const navigate = useNavigate();
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (ev) => {
    ev.preventDefault();
    if (password.length < 8) {
      toast("At least 8 characters", "error");
      return;
    }
    if (password !== confirm) {
      toast("Passwords do not match", "error");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) toast(error.message, "error");
    else {
      toast("Password updated successfully!", "success");
      navigate("/app/home");
    }
  };

  return (
    <div className=" page-container full-height flex flex-col px-6 safe-top overflow-y-auto page-enter">
      <div className="pt-5 pb-8" />
      <div className="flex-1 flex flex-col animate-slide-up">
        <CerebraLockup height={36} className="mb-8" />
        <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white mb-1">
          Set new password
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          Choose a strong password for your account.
        </p>
        <form onSubmit={handle} className="flex flex-col gap-4">
          <PasswordInput
            label="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
          <PasswordInput
            label="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            autoComplete="new-password"
          />
          <Button size="lg" loading={loading} type="submit" className="mt-2">
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
