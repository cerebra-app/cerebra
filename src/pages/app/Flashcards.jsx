import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import {
  Button,
  Input,
  Textarea,
  Card,
  EmptyState,
  Spinner,
  ErrorState,
} from "../../components/ui/index";

/* ---------------------------------------------------------- */
/* SM-2 spaced repetition                                       */
/* ---------------------------------------------------------- */
function sm2(quality, { repetitions, ease_factor, interval_days }) {
  let reps = repetitions;
  let ef = ease_factor;
  let interval = interval_days;

  if (quality < 3) {
    reps = 0;
    interval = 1;
  } else {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 6;
    else interval = Math.round(interval * ef);
    reps += 1;
  }

  ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ef < 1.3) ef = 1.3;

  const next = new Date();
  next.setDate(next.getDate() + interval);

  return {
    repetitions: reps,
    ease_factor: Math.round(ef * 100) / 100,
    interval_days: interval,
    next_review_at: next.toISOString(),
  };
}

/* ---------------------------------------------------------- */
/* Deck list                                                     */
/* ---------------------------------------------------------- */
function DeckList({ decks, dueCounts, onOpenDeck, onCreate }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-xl font-bold text-slate-800 dark:text-white">
          Flashcards
        </h1>
        <button onClick={onCreate} className="text-sm font-medium text-primary-400">
          + New deck
        </button>
      </div>

      {decks.length === 0 ? (
        <EmptyState
          icon="🗂️"
          title="No decks yet"
          description="Create a deck and start adding cards to study."
          action={<Button onClick={onCreate}>Create deck</Button>}
        />
      ) : (
        decks.map((deck) => (
          <Card
            key={deck.id}
            className="mb-3 !p-4 cursor-pointer"
            onClick={() => onOpenDeck(deck)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display font-semibold text-slate-800 dark:text-white text-sm">
                  {deck.title}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {deck.card_count} card{deck.card_count === 1 ? "" : "s"}
                </p>
              </div>
              {dueCounts[deck.id] > 0 && (
                <span className="text-xs font-semibold text-white bg-primary-400 rounded-full px-2.5 py-1">
                  {dueCounts[deck.id]} due
                </span>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Create deck                                                   */
/* ---------------------------------------------------------- */
function CreateDeck({ session, onCreated, onCancel, toast }) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast("Give your deck a name", "error");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("flashcard_decks")
      .insert({ user_id: session.user.id, title: title.trim() })
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast("Could not create deck", "error");
      return;
    }
    onCreated(data);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display text-xl font-bold text-slate-800 dark:text-white">
          New deck
        </h1>
      </div>
      <Input
        label="Deck name"
        placeholder="e.g. Organic Chemistry, French vocab"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-6"
      />
      <Button size="lg" loading={saving} onClick={handleCreate}>
        Create deck
      </Button>
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Generate with AI — from an existing document or pasted text  */
/* ---------------------------------------------------------- */
function GenerateWithAI({ session, deckId, initialDocId, onGenerated, onCancel, toast }) {
  const [mode, setMode] = useState("document"); // document | paste
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState(initialDocId || null);
  const [pastedText, setPastedText] = useState("");
  const [count, setCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadDocs = async () => {
      const { data } = await supabase
        .from("documents")
        .select("id, filename, file_type")
        .eq("user_id", session.user.id)
        .in("file_type", ["application/pdf", "text/plain"])
        .order("created_at", { ascending: false });
      setDocuments(data || []);
      setDocsLoading(false);
    };
    loadDocs();
  }, [session.user.id]);

  const handleGenerate = async () => {
    if (mode === "document" && !selectedDocId) {
      toast("Choose a document", "error");
      return;
    }
    if (mode === "paste" && !pastedText.trim()) {
      toast("Paste some text first", "error");
      return;
    }
    setGenerating(true);
    const { data, error } = await supabase.functions.invoke(
      "generate-study-material",
      {
        body: {
          output_type: "flashcards",
          count,
          document_id: mode === "document" ? selectedDocId : undefined,
          source_text: mode === "paste" ? pastedText.trim() : undefined,
        },
      }
    );
    setGenerating(false);

    if (error || data?.error) {
      // supabase-js hides the real error body behind a generic message for
      // non-2xx responses — the actual reason is on error.context (the raw Response).
      let message = data?.error || error?.message || "Generation failed";
      if (error?.context) {
        try {
          const body = await error.context.json();
          if (body?.error) message = body.error;
        } catch {
          // response wasn't JSON, keep the fallback message
        }
      }
      toast(message, "error");
      return;
    }

    const items = data.items || [];
    const rows = items.map((item) => ({
      deck_id: deckId,
      front: item.front,
      back: item.back,
    }));
    const { data: inserted, error: insertError } = await supabase
      .from("flashcards")
      .insert(rows)
      .select();
    if (insertError) {
      toast("Generated, but could not save cards", "error");
      return;
    }
    toast(`${inserted.length} cards generated`, "success");
    onGenerated(inserted);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="font-display text-lg font-bold text-slate-800 dark:text-white">
          Generate with AI
        </h2>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode("document")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mode === "document"
              ? "bg-primary-400 text-white"
              : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700"
          }`}
        >
          From a document
        </button>
        <button
          onClick={() => setMode("paste")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mode === "paste"
              ? "bg-primary-400 text-white"
              : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700"
          }`}
        >
          Paste text
        </button>
      </div>

      {mode === "document" ? (
        <>
          <label className="block mb-4">
            <input
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                if (file.type !== "application/pdf" && file.type !== "text/plain") {
                  toast("Only PDF or TXT files are supported for generation", "error");
                  return;
                }
                setUploading(true);
                const filePath = `${session.user.id}/${Date.now()}_${file.name}`;
                const { error: uploadError } = await supabase.storage
                  .from("documents")
                  .upload(filePath, file);
                if (uploadError) {
                  setUploading(false);
                  toast(uploadError.message || "Upload failed", "error");
                  return;
                }
                const { data: newDoc, error: dbError } = await supabase
                  .from("documents")
                  .insert({
                    user_id: session.user.id,
                    filename: file.name,
                    file_path: filePath,
                    file_type: file.type,
                    file_size: file.size,
                  })
                  .select()
                  .single();
                setUploading(false);
                if (dbError) {
                  toast("Uploaded but could not save record", "error");
                  return;
                }
                setDocuments((prev) => [newDoc, ...prev]);
                setSelectedDocId(newDoc.id);
                toast("Document uploaded", "success");
              }}
            />
            <span
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl
                border-2 border-dashed border-slate-200 dark:border-slate-700
                text-sm font-medium text-primary-400 hover:border-primary-300 transition-all cursor-pointer"
            >
              {uploading ? <Spinner size="sm" /> : "+ Upload a PDF or TXT file"}
            </span>
          </label>

          {docsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : documents.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              No PDF or TXT documents yet — upload one above, or paste text
              instead.
            </p>
          ) : (
            <div className="mb-4">
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl border mb-2 transition-all ${
                    selectedDocId === doc.id
                      ? "border-primary-400 bg-primary-50 dark:bg-primary-900/20"
                      : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800"
                  }`}
                >
                  <span className="text-sm font-medium text-slate-800 dark:text-white">
                    {doc.filename}
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <Textarea
          placeholder="Paste your notes or text here..."
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          className="mb-4 min-h-[140px]"
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Number of cards
        </span>
        <div className="flex gap-1.5">
          {[5, 10, 15, 20].map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all ${
                count === n
                  ? "bg-primary-400 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <Button size="lg" className="w-full" loading={generating} onClick={handleGenerate}>
        {generating ? "Generating…" : "Generate"}
      </Button>
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Deck detail — card list + add card                           */
/* ---------------------------------------------------------- */
function DeckDetail({ session, deck, cards, autoGenerateDocId, onCardsChanged, onBack, onStartStudy, dueCount, toast }) {
  const [addingOpen, setAddingOpen] = useState(false);
  const [generatingOpen, setGeneratingOpen] = useState(!!autoGenerateDocId);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!front.trim() || !back.trim()) {
      toast("Both sides are required", "error");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("flashcards")
      .insert({ deck_id: deck.id, front: front.trim(), back: back.trim() })
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast("Could not add card", "error");
      return;
    }
    onCardsChanged([...cards, data]);
    setFront("");
    setBack("");
    setAddingOpen(false);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("flashcards").delete().eq("id", id);
    if (error) {
      toast("Could not delete card", "error");
      return;
    }
    onCardsChanged(cards.filter((c) => c.id !== id));
  };

  if (generatingOpen) {
    return (
      <GenerateWithAI
        session={session}
        deckId={deck.id}
        initialDocId={autoGenerateDocId}
        onGenerated={(newCards) => {
          onCardsChanged([...cards, ...newCards]);
          setGeneratingOpen(false);
        }}
        onCancel={() => setGeneratingOpen(false)}
        toast={toast}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display text-lg font-bold text-slate-800 dark:text-white truncate">
          {deck.title}
        </h1>
      </div>

      {cards.length > 0 && (
        <Button
          size="lg"
          className="w-full mb-5"
          disabled={dueCount === 0}
          onClick={onStartStudy}
        >
          {dueCount > 0 ? `Study (${dueCount} due)` : "All caught up — nothing due"}
        </Button>
      )}

      {cards.length === 0 && !addingOpen ? (
        <EmptyState
          icon="📇"
          title="No cards yet"
          description="Add cards yourself, or generate them from a document."
          action={
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setAddingOpen(true)}>
                Add manually
              </Button>
              <Button onClick={() => setGeneratingOpen(true)}>
                Generate with AI
              </Button>
            </div>
          }
        />
      ) : (
        <>
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex items-start justify-between gap-3 py-3 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 mb-2"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-800 dark:text-white text-sm truncate">
                  {card.front}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{card.back}</p>
              </div>
              <button
                onClick={() => handleDelete(card.id)}
                className="text-slate-300 hover:text-red-400 transition-colors p-1 shrink-0"
                aria-label="Delete card"
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {addingOpen ? (
            <Card className="!p-4 mt-3">
              <Input
                placeholder="Front (question / term)"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                className="mb-3"
              />
              <Textarea
                placeholder="Back (answer / definition)"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                className="mb-4"
              />
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => setAddingOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" className="flex-1" loading={saving} onClick={handleAdd}>
                  Add card
                </Button>
              </div>
            </Card>
          ) : (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setAddingOpen(true)}
                className="flex-1 py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700
                  text-sm font-medium text-primary-400 hover:border-primary-300 transition-all"
              >
                + Add card
              </button>
              <button
                onClick={() => setGeneratingOpen(true)}
                className="flex-1 py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700
                  text-sm font-medium text-primary-400 hover:border-primary-300 transition-all"
              >
                ✨ Generate with AI
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Study session — flip card, rate, SM-2 update                 */
/* ---------------------------------------------------------- */
function StudySession({ dueCards, onFinish, toast }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [rating, setRating] = useState(false);

  const card = dueCards[index];
  const isLast = index === dueCards.length - 1;

  const handleRate = async (quality) => {
    setRating(true);
    const update = sm2(quality, card);
    const { error } = await supabase
      .from("flashcards")
      .update(update)
      .eq("id", card.id);
    setRating(false);
    if (error) {
      toast("Could not save progress", "error");
      return;
    }
    if (isLast) {
      onFinish();
    } else {
      setFlipped(false);
      setIndex((i) => i + 1);
    }
  };

  if (!card) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-slate-400">
          {index + 1} of {dueCards.length}
        </span>
        <button onClick={onFinish} className="text-sm font-medium text-slate-400">
          End session
        </button>
      </div>

      <div
        onClick={() => setFlipped((f) => !f)}
        className="min-h-[220px] flex items-center justify-center text-center p-6
          bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700
          shadow-card cursor-pointer mb-6"
      >
        <p className="font-display font-semibold text-lg text-slate-800 dark:text-white">
          {flipped ? card.back : card.front}
        </p>
      </div>

      {!flipped ? (
        <Button size="lg" className="w-full" onClick={() => setFlipped(true)}>
          Show answer
        </Button>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="flex-1"
            loading={rating}
            onClick={() => handleRate(2)}
          >
            Again
          </Button>
          <Button
            className="flex-1"
            loading={rating}
            onClick={() => handleRate(4)}
          >
            Good
          </Button>
          <Button
            variant="subtle"
            className="flex-1"
            loading={rating}
            onClick={() => handleRate(5)}
          >
            Easy
          </Button>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Root page                                                     */
/* ---------------------------------------------------------- */
export default function Flashcards() {
  const { session } = useApp();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [decks, setDecks] = useState([]);
  const [dueCounts, setDueCounts] = useState({});
  const [screen, setScreen] = useState("list"); // list | create | detail | study
  const [activeDeck, setActiveDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [autoGenerateDocId, setAutoGenerateDocId] = useState(null);
  const [incomingDocHandled, setIncomingDocHandled] = useState(false);

  const fetchDecks = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("flashcard_decks")
      .select("*, flashcards(count)")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: true });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    const decksWithCount = (data || []).map((d) => ({
      ...d,
      card_count: d.flashcards?.[0]?.count || 0,
    }));
    setDecks(decksWithCount);

    const nowIso = new Date().toISOString();
    const counts = {};
    await Promise.all(
      decksWithCount.map(async (d) => {
        const { count } = await supabase
          .from("flashcards")
          .select("id", { count: "exact", head: true })
          .eq("deck_id", d.id)
          .lte("next_review_at", nowIso);
        counts[d.id] = count || 0;
      })
    );
    setDueCounts(counts);
    setLoading(false);
  };

  useEffect(() => {
    fetchDecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.user.id]);

  const fetchCards = async (deckId) => {
    const { data, error } = await supabase
      .from("flashcards")
      .select("*")
      .eq("deck_id", deckId)
      .order("created_at", { ascending: true });
    if (!error) setCards(data || []);
  };

  const openDeck = (deck) => {
    setActiveDeck(deck);
    setAutoGenerateDocId(null);
    setScreen("detail");
    fetchCards(deck.id);
  };

  useEffect(() => {
    const fromDocumentId = location.state?.fromDocumentId;
    const fromDocumentName = location.state?.fromDocumentName;
    if (!fromDocumentId || incomingDocHandled || loading) return;

    const handleIncoming = async () => {
      setIncomingDocHandled(true);
      const deckTitle = (fromDocumentName || "Generated deck").replace(
        /\.[^/.]+$/,
        ""
      );
      let deck = decks.find((d) => d.title === deckTitle);
      if (!deck) {
        const { data, error } = await supabase
          .from("flashcard_decks")
          .insert({ user_id: session.user.id, title: deckTitle })
          .select()
          .single();
        if (error) {
          toast("Could not create deck for this document", "error");
          return;
        }
        deck = { ...data, card_count: 0 };
        setDecks((prev) => [...prev, deck]);
        setDueCounts((prev) => ({ ...prev, [deck.id]: 0 }));
      }
      setActiveDeck(deck);
      setAutoGenerateDocId(fromDocumentId);
      setScreen("detail");
      fetchCards(deck.id);
      // clear the navigation state so this doesn't re-trigger on remount
      navigate(location.pathname, { replace: true, state: {} });
    };

    handleIncoming();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, location.state, incomingDocHandled]);

  const handleCreated = (deck) => {
    setDecks((prev) => [...prev, { ...deck, card_count: 0 }]);
    setDueCounts((prev) => ({ ...prev, [deck.id]: 0 }));
    openDeck({ ...deck, card_count: 0 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState description={error} onRetry={fetchDecks} />;
  }

  return (
    <div className="px-5 pt-6 pb-8">
      {screen === "list" && (
        <DeckList
          decks={decks}
          dueCounts={dueCounts}
          onOpenDeck={openDeck}
          onCreate={() => setScreen("create")}
        />
      )}

      {screen === "create" && (
        <CreateDeck
          session={session}
          onCreated={handleCreated}
          onCancel={() => setScreen("list")}
          toast={toast}
        />
      )}

      {screen === "detail" && activeDeck && (
        <DeckDetail
          session={session}
          deck={activeDeck}
          cards={cards}
          autoGenerateDocId={autoGenerateDocId}
          onCardsChanged={(next) => {
            setCards(next);
            setDecks((prev) =>
              prev.map((d) =>
                d.id === activeDeck.id ? { ...d, card_count: next.length } : d
              )
            );
          }}
          onBack={() => {
            setScreen("list");
            fetchDecks();
          }}
          onStartStudy={() => setScreen("study")}
          dueCount={dueCounts[activeDeck.id] || 0}
          toast={toast}
        />
      )}

      {screen === "study" && activeDeck && (
        <StudySession
          dueCards={cards.filter(
            (c) => new Date(c.next_review_at) <= new Date()
          )}
          onFinish={() => {
            setScreen("detail");
            fetchCards(activeDeck.id);
            fetchDecks();
          }}
          toast={toast}
        />
      )}
    </div>
  );
}
