import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import { Button, Input } from "../../components/ui/index";
import { CerebraIcon } from "../../components/ui/Logo";

const STEPS = ["welcome", "university", "features"];

const FEATURE_OPTIONS = [
  { id: "tasks", emoji: "✅", label: "Task manager" },
  { id: "journal", emoji: "📓", label: "Daily journal" },
  { id: "streak", emoji: "🔥", label: "Study streaks" },
  { id: "breathing", emoji: "🌿", label: "Breathing exercises" },
  { id: "quiz", emoji: "🧠", label: "AI quiz generator" },
  { id: "counselor", emoji: "🤝", label: "Counselor booking" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { createProfile, session } = useApp();
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
    const { error } = await createProfile({
      display_name: displayName.trim(),
      university: university.trim(),
      email: session?.user?.email,
      theme: "system",
      show_quotes: true,
      show_streak: true,
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
    <div className="page-container min-h-screen flex flex-col px-6 py-8">
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
          <div className="text-5xl text-center mb-6">🎓</div>
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
          <div className="mt-auto pt-8 flex gap-3">
            <Button
              variant="ghost"
              size="lg"
              className="flex-none w-auto px-6"
              onClick={() => setStep(0)}
            >
              ←
            </Button>
            <Button size="lg" className="flex-1" onClick={handleNext}>
              Continue →
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 — Feature preferences */}
      {step === 2 && (
        <div className="flex-1 flex flex-col animate-slide-up">
          <div className="text-5xl text-center mb-6">⚡</div>
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
                        ? "border-primary-400 bg-primary-50 text-primary-700"
                        : "border-slate-100 bg-white text-slate-600 hover:border-primary-200"
                    }`}
                >
                  <span className="text-xl">{f.emoji}</span>
                  <span className="text-sm font-medium leading-tight">
                    {f.label}
                  </span>
                  {selected && (
                    <span className="ml-auto text-primary-400">
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

          <div className="mt-auto flex gap-3">
            <Button
              variant="ghost"
              size="lg"
              className="flex-none w-auto px-6"
              onClick={() => setStep(1)}
            >
              ←
            </Button>
            <Button
              size="lg"
              className="flex-1"
              loading={loading}
              disabled={selectedFeatures.length === 0}
              onClick={handleFinish}
            >
              Let's go 🎉
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
