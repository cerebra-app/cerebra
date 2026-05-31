import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import { Button, Input } from "../../components/ui/index";
import { CerebraIcon } from "../../components/ui/Logo";

const STEPS = ["welcome", "university", "features"];

const FEATURE_OPTIONS = [
  {
    id: "tasks",
    label: "Task manager",
    icon: (
      <svg
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
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
    id: "journal",
    label: "Daily journal",
    icon: (
      <svg
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
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
    id: "streak",
    label: "Study streaks",
    icon: (
      <svg
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
  {
    id: "breathing",
    label: "Breathing exercises",
    icon: (
      <svg
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
  },
  {
    id: "quiz",
    label: "AI quiz generator",
    icon: (
      <svg
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  },
  {
    id: "counselor",
    label: "Counselor booking",
    icon: (
      <svg
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateProfile, session } = useApp();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [university, setUniversity] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const toggleFeature = (id) => {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step === 0) {
      if (!displayName.trim()) {
        setErrors({ displayName: "Please enter your name" });
        return;
      }
      setErrors({});
      setStep(1);
    } else if (step === 1) {
      if (!university.trim()) {
        setErrors({ university: "Please enter your university" });
        return;
      }
      setErrors({});
      setStep(2);
    }
  };

  const handleFinish = async () => {
    setLoading(true);

    // Profile already exists from signup — updating it with onboarding data
    const { error } = await updateProfile({
      display_name: displayName.trim(),
      university: university.trim(),
      theme: "system",
      show_quotes: true,
      show_streak: true,
      onboarding_complete: true,
    });

    setLoading(false);
    if (error) {
      toast("Something went wrong. Please try again.", "error");
    } else {
      navigate("/app/home");
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className=" page-container full-height flex flex-col px-6 py-8 overflow-y-auto">
      {/* Progress bar */}
      <div className="w-full bg-primary-50 rounded-full h-1.5 mb-8">
        <div
          className="bg-primary-400 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step 0 — Welcome + name */}
      {step === 0 && (
        <div className="flex-1 flex flex-col animate-slide-up">
          <div className="flex justify-center mb-8">
            <CerebraIcon size={64} />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-800 mb-2 text-center">
            Welcome to Cerebra 👋
          </h1>
          <p className="text-slate-400 text-sm text-center leading-relaxed mb-10">
            Let's get your space set up. This takes about 30 seconds.
          </p>
          <Input
            label="What should we call you?"
            type="text"
            placeholder="Your first name or nickname"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setErrors({});
            }}
            error={errors.displayName}
            autoFocus
          />
          <div className="mt-auto pt-8">
            <Button size="lg" onClick={handleNext}>
              Continue →
            </Button>
          </div>
        </div>
      )}

      {/* Step 1 — University */}
      {step === 1 && (
        <div className="flex-1 flex flex-col animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-primary-400/10 flex items-center justify-center mx-auto mb-6 text-primary-400">
            <svg
              width="28"
              height="28"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
              />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-800 mb-2 text-center">
            Where do you study?
          </h1>
          <p className="text-slate-400 text-sm text-center leading-relaxed mb-10">
            This helps us tailor your experience.
          </p>
          <Input
            label="University name"
            type="text"
            placeholder="e.g. University of Lagos"
            value={university}
            onChange={(e) => {
              setUniversity(e.target.value);
              setErrors({});
            }}
            error={errors.university}
            autoFocus
          />
          <div className="mt-auto pt-8 grid grid-cols-4 gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              className="col-span-1"
            >
              ←
            </Button>
            <Button
              onClick={step === 1 ? handleNext : handleFinish}
              loading={loading}
              disabled={step === 2 && selectedFeatures.length === 0}
              className="col-span-3"
            >
              {step === 2 ? "Let's go 🎉" : "Continue →"}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 — Feature preferences */}
      {step === 2 && (
        <div className="flex-1 flex flex-col animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-primary-400/10 flex items-center justify-center mx-auto mb-6 text-primary-400">
            <svg
              width="28"
              height="28"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-800 mb-2 text-center">
            What matters to you?
          </h1>
          <p className="text-slate-400 text-sm text-center leading-relaxed mb-6">
            Pick what you're most excited about. You can always change this
            later.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {FEATURE_OPTIONS.map((f) => {
              const selected = selectedFeatures.includes(f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => toggleFeature(f.id)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 text-left
          ${
            selected
              ? "border-primary-400 bg-primary-400/10 text-primary-400"
              : "border-slate-700 bg-slate-800 text-slate-300 hover:border-primary-600"
          }`}
                >
                  <span
                    className={selected ? "text-primary-400" : "text-slate-400"}
                  >
                    {f.icon}
                  </span>
                  <span className="text-sm font-medium leading-tight">
                    {f.label}
                  </span>
                  {selected && (
                    <span className="ml-auto text-primary-400 shrink-0">
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-slate-400 text-center mb-6">
            {selectedFeatures.length === 0
              ? "Select at least one to continue"
              : `${selectedFeatures.length} selected — great choice!`}
          </p>

          <div className="mt-auto pt-8 grid grid-cols-4 gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              className="col-span-1"
            >
              ←
            </Button>
            <Button
              onClick={step === 1 ? handleNext : handleFinish}
              loading={loading}
              disabled={step === 2 && selectedFeatures.length === 0}
              className="col-span-3"
            >
              {step === 2 ? "Let's go 🎉" : "Continue →"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
