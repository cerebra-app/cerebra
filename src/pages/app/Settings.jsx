import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import {
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getNotificationStatus,
} from "../../lib/notifications";
import { supabase } from "../../lib/supabase";
import {
  Input,
  Button,
  Toggle,
  PasswordInput,
} from "../../components/ui/index";

function SectionLabel({ label }) {
  return (
    <p className="px-5 pt-6 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
      {label}
    </p>
  );
}

function SettingsRow({ label, sublabel, children }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </p>
        {sublabel && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {sublabel}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-slate-100 mx-5" />;
}

const THEMES = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { profile, updateProfile, signOut, session } = useApp();
  const toast = useToast();

  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [university, setUniversity] = useState(profile?.university || "");
  const [driveLink, setDriveLink] = useState(profile?.drive_link || "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const appearanceRef = useRef(null);
  const location = useLocation();

  const [notifStatus, setNotifStatus] = useState(getNotificationStatus());
  const [enablingNotif, setEnablingNotif] = useState(false);

  useEffect(() => {
    if (location.search.includes("tab=profile")) return; // profile stays at top
    if (location.search.includes("tab=appearance")) {
      setTimeout(() => {
        appearanceRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [location.search]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setUniversity(profile.university || "");
      setDriveLink(profile.drive_link || "");
    }
  }, [profile]);

  const handleEnableNotifications = async () => {
    // console.log("Starting enable");
    setEnablingNotif(true);

    const permResult = await requestNotificationPermission();
    if (permResult.error) {
      toast(
        permResult.error === "Permission denied"
          ? "Notifications blocked. Enable them in your browser settings."
          : permResult.error,
        "error"
      );
      setEnablingNotif(false);
      return;
    }

    const subResult = await subscribeToPush();
    if (subResult.error) {
      toast("Could not enable notifications", "error");
      setEnablingNotif(false);
      return;
    }

    // Save subscription to Supabase
    const { error: saveError } = await supabase
      .from("push_subscriptions")
      .upsert({
        user_id: session.user.id,
        subscription: subResult.subscription.toJSON(),
        device_name: navigator.userAgent.includes("Mobile")
          ? "Mobile"
          : "Desktop",
      });

    if (saveError) {
      toast("Enabled but could not save subscription", "warning");
    } else {
      toast("Notifications enabled!", "success");
    }
    setNotifStatus("granted");
    setEnablingNotif(false);
  };

  const handleDisableNotifications = async () => {
    await unsubscribeFromPush();
    await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", session.user.id);
    setNotifStatus("default");
    toast("Notifications disabled", "success");
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      toast("Display name is required", "error");
      return;
    }
    setSavingProfile(true);
    const { error } = await updateProfile({
      display_name: displayName.trim(),
      university: university.trim(),
      drive_link: driveLink.trim(),
    });
    setSavingProfile(false);
    if (error) toast("Could not save profile", "error");
    else toast("Profile updated", "success");
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setSavingPassword(true);

    // Verify current password by re-authenticating
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: currentPassword,
    });

    if (signInError) {
      setSavingPassword(false);
      setPasswordError("Current password is incorrect");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      setPasswordError(error.message);
    } else {
      toast("Password updated", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleTheme = async (theme) => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else if (theme === "light") root.classList.remove("dark");
    else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      root.classList.toggle("dark", prefersDark);
    }
    await updateProfile({ theme });
  };

  const handleToggle = async (field, value) => {
    await updateProfile({ [field]: value });
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    // Delete all user data
    await supabase.from("tasks").delete().eq("user_id", session.user.id);
    await supabase
      .from("journal_entries")
      .delete()
      .eq("user_id", session.user.id);
    await supabase.from("streaks").delete().eq("user_id", session.user.id);
    await supabase
      .from("notify_requests")
      .delete()
      .eq("user_id", session.user.id);
    await supabase.from("profiles").delete().eq("id", session.user.id);
    await supabase.auth.admin?.deleteUser(session.user.id);
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-surface pb-12 dark:bg-slate-900 page-enter">
      {/* Header */}
      <div className="px-5 pt-8 pb-2 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center
            text-slate-400 hover:text-primary-400 hover:bg-primary-50 transition-all"
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
        </button>
        <h1 className="font-display text-xl font-bold text-slate-800">
          Settings
        </h1>
      </div>

      {/* Profile */}
      <div
        className="bg-white dark:bg-slate-800 rounded-3xl mx-5 mt-4 overflow-hidden 
  border border-slate-100 dark:border-slate-700 shadow-card"
      >
        <SectionLabel label="Profile" />
        <div className="px-5 pb-4 flex flex-col gap-3">
          <Input
            label="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
          />
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              Username
            </label>
            <div
              className="input bg-slate-50 dark:bg-slate-700/50 text-slate-400 
    cursor-not-allowed select-none"
            >
              @{profile?.username}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              Email
            </label>
            <div
              className="input bg-slate-50 dark:bg-slate-700/50 text-slate-400 
    cursor-not-allowed select-none"
            >
              {session?.user?.email}
            </div>
          </div>
          <Input
            label="University"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            placeholder="Your university"
          />
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              Google Drive link
            </label>
            <Input
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              placeholder="https://drive.google.com/..."
            />
            {profile?.drive_link && (
              <button
                onClick={() =>
                  window.open(
                    profile.drive_link,
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
                className="mt-2 w-full flex items-center justify-center gap-2
        bg-primary-50 text-primary-500 text-xs font-medium py-2.5
        rounded-xl transition-all active:scale-[0.99] hover:bg-primary-100"
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
                Open Google Drive
              </button>
            )}
          </div>
          <Input
            label="Google Drive link"
            value={driveLink}
            onChange={(e) => setDriveLink(e.target.value)}
            placeholder="https://drive.google.com/..."
          />
          <Button size="md" loading={savingProfile} onClick={handleSaveProfile}>
            Save profile
          </Button>
        </div>
      </div>

      {/* Appearance */}
      <div
        ref={appearanceRef}
        className="bg-white dark:bg-slate-800 rounded-3xl mx-5 mt-3 overflow-hidden border border-slate-100 dark:border-slate-700 shadow-card"
      >
        <SectionLabel label="Appearance" />
        <div className="px-5 pb-4">
          <p className="text-sm font-medium text-slate-600 mb-2">Theme</p>
          <div className="flex gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTheme(t.id)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all
                  ${
                    profile?.theme === t.id
                      ? "bg-primary-400 text-white"
                      : "bg-primary-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-primary-100 dark:hover:bg-slate-600"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Home screen */}
      <div
        className="bg-white dark:bg-slate-800 rounded-3xl mx-5 mt-4 overflow-hidden 
  border border-slate-100 dark:border-slate-700 shadow-card"
      >
        <SectionLabel label="Home screen" />
        <SettingsRow
          label="Motivational quotes"
          sublabel="Show a daily quote on your home screen"
        >
          <Toggle
            checked={profile?.show_quotes !== false}
            onChange={(v) => handleToggle("show_quotes", v)}
          />
        </SettingsRow>
        <Divider />
        <SettingsRow
          label="Study streak calendar"
          sublabel="Show your check-in calendar on home"
        >
          <Toggle
            checked={profile?.show_streak !== false}
            onChange={(v) => handleToggle("show_streak", v)}
          />
        </SettingsRow>
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl mx-5 mt-3 overflow-hidden border border-slate-100 dark:border-slate-700 shadow-card">
        <SectionLabel label="Security" />
        <div className="px-5 pb-4 flex flex-col gap-3">
          <PasswordInput
            label="Current password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              setPasswordError("");
            }}
            placeholder="Your current password"
          />
          <PasswordInput
            label="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
          <PasswordInput
            label="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
          />
          {passwordError && (
            <p className="text-xs text-red-500">{passwordError}</p>
          )}
          <Button
            variant="ghost"
            size="md"
            loading={savingPassword}
            onClick={handleChangePassword}
          >
            Update password
          </Button>
        </div>
      </div>

      {/* Journal PIN */}
      <div
        className="bg-white dark:bg-slate-800 rounded-3xl mx-5 mt-4 overflow-hidden 
  border border-slate-100 dark:border-slate-700 shadow-card"
      >
        <SectionLabel label="Journal" />
        <SettingsRow
          label="Journal PIN"
          sublabel={
            profile?.journal_pin
              ? "PIN is set — journal is protected"
              : "No PIN set"
          }
        >
          <button
            onClick={async () => {
              const pin = prompt("Enter a new 4-digit PIN:");
              if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
                toast("PIN must be exactly 4 digits", "error");
                return;
              }
              const { error } = await updateProfile({ journal_pin: pin });
              if (error) toast("Could not update PIN", "error");
              else toast("Journal PIN updated", "success");
            }}
            className="text-xs font-medium text-primary-400 hover:text-primary-500 transition-colors"
          >
            {profile?.journal_pin ? "Change PIN" : "Set PIN"}
          </button>
        </SettingsRow>
      </div>

      {/* Mindfulness */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl mx-5 mt-3 overflow-hidden border border-slate-100 dark:border-slate-700 shadow-card">
        <SectionLabel label="Mindfulness" />
        <div className="px-5 pb-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
            Session duration
          </p>
          <div className="flex gap-2">
            {[3, 5, 10].map((mins) => (
              <button
                key={mins}
                onClick={() => handleToggle("mindfulness_duration", mins)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all
            ${
              (profile?.mindfulness_duration || 5) === mins
                ? "bg-primary-400 text-white"
                : "bg-primary-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-primary-100"
            }`}
              >
                {mins} min
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications placeholder */}
      {/* Notifications */}
      <div
        className="bg-white dark:bg-slate-800 rounded-3xl mx-5 mt-3 overflow-hidden
  border border-slate-100 dark:border-slate-700 shadow-card"
      >
        <SectionLabel label="Notifications" />

        {notifStatus === "granted" ? (
          <>
            <SettingsRow
              label="Notifications enabled"
              sublabel="You'll receive reminders and updates"
            >
              <button
                onClick={handleDisableNotifications}
                className="text-xs text-red-400 font-medium hover:text-red-500 transition-colors"
              >
                Disable
              </button>
            </SettingsRow>
            <Divider />
            <SettingsRow
              label="Task due reminders"
              sublabel="Daily at 8am for tasks due today"
            >
              <Toggle
                checked={profile?.notif_task_due !== false}
                onChange={(v) => handleToggle("notif_task_due", v)}
              />
            </SettingsRow>
            <Divider />
            <SettingsRow
              label="Overdue task alerts"
              sublabel="Morning reminder for overdue tasks"
            >
              <Toggle
                checked={profile?.notif_task_overdue !== false}
                onChange={(v) => handleToggle("notif_task_overdue", v)}
              />
            </SettingsRow>
            <Divider />
            <SettingsRow
              label="Journal reminder"
              sublabel="Evening nudge to write in your journal"
            >
              <Toggle
                checked={profile?.notif_journal_reminder !== false}
                onChange={(v) => handleToggle("notif_journal_reminder", v)}
              />
            </SettingsRow>
            <Divider />
            <SettingsRow
              label="Streak reminder"
              sublabel="If you haven't checked in by 8pm"
            >
              <Toggle
                checked={profile?.notif_streak !== false}
                onChange={(v) => handleToggle("notif_streak", v)}
              />
            </SettingsRow>
            <Divider />
            <SettingsRow
              label="Mindfulness reminder"
              sublabel="Daily breathing session reminder"
            >
              <Toggle
                checked={profile?.notif_mindfulness === true}
                onChange={(v) => handleToggle("notif_mindfulness", v)}
              />
            </SettingsRow>
            <Divider />
            <SettingsRow
              label="Streak milestones"
              sublabel="Celebrate streak achievements"
            >
              <Toggle
                checked={profile?.notif_milestones !== false}
                onChange={(v) => handleToggle("notif_milestones", v)}
              />
            </SettingsRow>
          </>
        ) : notifStatus === "denied" ? (
          <div className="px-5 py-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              Notifications are blocked. To enable them, go to your browser
              settings and allow notifications for this site.
            </p>
          </div>
        ) : (
          <div className="px-5 py-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Get reminders for tasks, journal entries, streaks and more.
            </p>
            <Button
              size="md"
              loading={enablingNotif}
              onClick={handleEnableNotifications}
            >
              Enable notifications
            </Button>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div
        className="bg-white dark:bg-slate-800 rounded-3xl mx-5 mt-4 overflow-hidden 
  border border-slate-100 dark:border-slate-700 shadow-card"
      >
        <SectionLabel label="Danger zone" />
        <div className="px-5 pb-4">
          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="w-full py-3 rounded-2xl border border-red-200 text-red-500
                text-sm font-medium transition-all hover:bg-red-50 active:scale-[0.99]"
            >
              Delete my account
            </button>
          ) : (
            <div className="bg-red-50 rounded-2xl p-4">
              <p className="text-sm font-medium text-red-700 mb-1">
                Are you sure?
              </p>
              <p className="text-xs text-red-400 mb-4">
                This will permanently delete your account, tasks, journal
                entries, and all data. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => setDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  loading={deleteLoading}
                  onClick={handleDeleteAccount}
                >
                  Delete everything
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* About */}
      <div className="px-5 pt-6 text-center">
        <p className="text-xs text-slate-400">Cerebra · Version 1.0.0</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <Link
            to="/privacy"
            className="text-xs text-primary-400 underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          <span className="text-slate-300 text-xs">·</span>
          <Link
            to="/terms"
            className="text-xs text-primary-400 underline underline-offset-2"
          >
            Terms of Use
          </Link>
        </div>
      </div>
    </div>
  );
}
