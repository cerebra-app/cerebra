import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import { Button, Textarea, Input, Card, EmptyState, Spinner } from "../../components/ui/index";

const RESOURCES = [
  {
    name: "Mentally Aware Nigeria Initiative (MANI)",
    detail: "Urgent mental health support line",
    contact: "08091116264 / 08111680686",
    url: "https://mentallyaware.org/emergency/",
  },
  {
    name: "SURPIN (Suicide Research & Prevention Initiative)",
    detail: "24-hour helpline for depression, anxiety, and suicidal thoughts",
    url: "https://www.nigerianmentalhealth.org/helplines",
  },
  {
    name: "She Writes Woman",
    detail: "Mental health support and crisis line",
    url: "https://www.nigerianmentalhealth.org/helplines",
  },
  {
    name: "Find A Helpline — Nigeria directory",
    detail: "Full, regularly-updated list of Nigerian crisis lines by topic",
    url: "https://findahelpline.com/countries/ng",
  },
];

function formatSlot(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/* ---------------------------------------------------------- */
/* Counselor detail — pick an available slot                    */
/* ---------------------------------------------------------- */
function CounselorDetail({ session, counselor, onBack, onBooked, toast }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmSlot, setConfirmSlot] = useState(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("counselor_slots")
        .select("*")
        .eq("counselor_id", counselor.id)
        .eq("is_booked", false)
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true });
      setSlots(data || []);
      setLoading(false);
    };
    load();
  }, [counselor.id]);

  const handleBook = async (slot) => {
    setBooking(true);
    const { error: bookingError } = await supabase.from("counselor_bookings").insert({
      user_id: session.user.id,
      counselor_id: counselor.id,
      slot_id: slot.id,
    });
    if (bookingError) {
      setBooking(false);
      toast(
        bookingError.code === "23505"
          ? "That slot was just booked by someone else"
          : "Could not book this slot",
        "error"
      );
      return;
    }
    await supabase.from("counselor_slots").update({ is_booked: true }).eq("id", slot.id);
    setBooking(false);
    setConfirmSlot(null);
    toast("Session booked", "success");
    onBooked();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <p className="font-display font-bold text-slate-800 dark:text-white">
            {counselor.name}
          </p>
          {counselor.title && (
            <p className="text-xs text-slate-400">{counselor.title}</p>
          )}
        </div>
      </div>

      {counselor.bio && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{counselor.bio}</p>
      )}

      <h2 className="font-display font-semibold text-slate-800 dark:text-white text-sm mb-3">
        Available times
      </h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : slots.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">
          No open slots right now — check back soon.
        </p>
      ) : (
        slots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => setConfirmSlot(slot)}
            className="w-full text-left px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-700
              bg-white dark:bg-slate-800 mb-2 hover:border-primary-200 transition-all"
          >
            <span className="text-sm font-medium text-slate-800 dark:text-white">
              {formatSlot(slot.start_time)}
            </span>
          </button>
        ))
      )}

      {confirmSlot && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm">
            <p className="font-display font-bold text-lg text-slate-800 dark:text-white mb-1">
              Confirm session
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              {counselor.name} · {formatSlot(confirmSlot.start_time)}
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setConfirmSlot(null)}>
                Cancel
              </Button>
              <Button className="flex-1" loading={booking} onClick={() => handleBook(confirmSlot)}>
                Book
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Root page                                                     */
/* ---------------------------------------------------------- */
export default function Counselor() {
  const { session } = useApp();
  const toast = useToast();
  const [preferredTime, setPreferredTime] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [pastRequests, setPastRequests] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [activeCounselor, setActiveCounselor] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const [{ data: requests }, { data: activeCounselors }, { data: bookings }] =
      await Promise.all([
        supabase
          .from("counselor_requests")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false }),
        supabase.from("counselors").select("*").eq("is_active", true),
        supabase
          .from("counselor_bookings")
          .select("*, counselors(name), counselor_slots(start_time)")
          .eq("user_id", session.user.id)
          .eq("status", "confirmed")
          .order("created_at", { ascending: false }),
      ]);
    setPastRequests(requests || []);
    setCounselors(activeCounselors || []);
    setMyBookings(bookings || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.user.id]);

  const handleSubmit = async () => {
    if (!note.trim()) {
      toast("Tell us a little about what you'd like to talk through", "error");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("counselor_requests").insert({
      user_id: session.user.id,
      preferred_time: preferredTime.trim() || null,
      note: note.trim(),
    });
    setSaving(false);
    if (error) {
      toast("Could not send request", "error");
      return;
    }
    setNote("");
    setPreferredTime("");
    toast("Request sent", "success");
    fetchAll();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (activeCounselor) {
    return (
      <div className="px-5 pt-6 pb-8">
        <CounselorDetail
          session={session}
          counselor={activeCounselor}
          onBack={() => setActiveCounselor(null)}
          onBooked={() => {
            setActiveCounselor(null);
            fetchAll();
          }}
          toast={toast}
        />
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-8">
      <h1 className="font-display text-xl font-bold text-slate-800 dark:text-white mb-1">
        Book a counselor
      </h1>
      <p className="text-sm text-slate-400 mb-6">
        If you need to talk to someone right now, use a hotline below — they're
        staffed and immediate.
      </p>

      {myBookings.length > 0 && (
        <div className="mb-6">
          <h2 className="font-display font-semibold text-slate-800 dark:text-white text-sm mb-3">
            Your upcoming sessions
          </h2>
          {myBookings.map((b) => (
            <Card key={b.id} className="mb-2 !p-4">
              <p className="text-sm font-medium text-slate-800 dark:text-white">
                {b.counselors?.name}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {b.counselor_slots?.start_time && formatSlot(b.counselor_slots.start_time)}
              </p>
            </Card>
          ))}
        </div>
      )}

      <div className="mb-6">
        <h2 className="font-display font-semibold text-slate-800 dark:text-white text-sm mb-3">
          Available counselors
        </h2>
        {counselors.length === 0 ? (
          <EmptyState
            icon="🗓️"
            title="No counselors currently available"
            description="We're onboarding verified professionals — check back soon. In the meantime, the hotlines below are staffed and immediate, or send a request further down and our team will follow up."
          />
        ) : (
          counselors.map((c) => (
            <Card
              key={c.id}
              className="mb-3 !p-4 cursor-pointer"
              onClick={() => setActiveCounselor(c)}
            >
              <p className="font-display font-semibold text-slate-800 dark:text-white text-sm">
                {c.name}
              </p>
              {c.title && <p className="text-xs text-slate-400 mt-0.5">{c.title}</p>}
            </Card>
          ))
        )}
      </div>

      <div className="mb-6">
        {RESOURCES.map((r) => (
          <a
            key={r.name}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 mb-2"
          >
            <p className="font-display font-semibold text-slate-800 dark:text-white text-sm">
              {r.name}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{r.detail}</p>
            {r.contact && (
              <p className="text-xs font-medium text-primary-400 mt-1">{r.contact}</p>
            )}
          </a>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-card mb-6">
        <h2 className="font-display font-semibold text-slate-800 dark:text-white text-sm mb-3">
          Request a check-in
        </h2>
        <Input
          label="Preferred time (optional)"
          placeholder="e.g. Weekday evenings"
          value={preferredTime}
          onChange={(e) => setPreferredTime(e.target.value)}
          className="mb-3"
        />
        <Textarea
          label="What would you like to talk about?"
          placeholder="Share as much or as little as you're comfortable with..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mb-4 min-h-[100px]"
        />
        <Button className="w-full" loading={saving} onClick={handleSubmit}>
          Send request
        </Button>
      </div>

      {pastRequests.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-slate-800 dark:text-white text-sm mb-3">
            Your requests
          </h2>
          {pastRequests.map((r) => (
            <Card key={r.id} className="mb-2 !p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    r.status === "pending"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-emerald-100 text-emerald-600"
                  }`}
                >
                  {r.status}
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200">{r.note}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
