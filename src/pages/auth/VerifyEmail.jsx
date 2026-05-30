import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { CerebraLockup } from "../../components/ui/Logo";
import { Button } from "../../components/ui/index";
import { useToast } from "../../context/ToastContext";

export default function VerifyEmail() {
  const toast = useToast();
  const [resending, setResending] = useState(false);

  const resend = async () => {
    setResending(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user?.email) {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: session.user.email,
      });
      if (error) toast("Could not resend. Try again shortly.", "error");
      else toast("Verification email sent!", "success");
    }
    setResending(false);
  };

  return (
    <div className="page-container min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <CerebraLockup height={36} className="mb-10" />
      <div className="text-5xl mb-6">✉️</div>
      <h1 className="font-display text-2xl font-bold text-slate-800 mb-3">
        Check your email
      </h1>
      <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-8">
        We sent a verification link to your email address. Tap it to activate
        your account and get started.
      </p>
      <p className="text-xs text-slate-400 mb-4">Didn't get it?</p>
      <Button variant="ghost" size="md" loading={resending} onClick={resend}>
        Resend verification email
      </Button>
    </div>
  );
}
