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

function ResultsRing({ correct, total }) {
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center py-6">
      <svg width="140" height="140" viewBox="0 0 140 140" className="mb-5">
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-slate-100 dark:text-slate-700"
          strokeWidth="12"
        />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-primary-400"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
        />
        <text
          x="70"
          y="76"
          textAnchor="middle"
          className="font-display font-bold text-2xl fill-slate-800 dark:fill-white"
        >
          {pct}%
        </text>
      </svg>
      <p className="font-display font-semibold text-slate-800 dark:text-white mb-1">
        {correct} of {total} correct
      </p>
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Quiz list                                                     */
/* ---------------------------------------------------------- */
function QuizList({ quizzes, onOpenQuiz, onCreate }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-xl font-bold text-slate-800 dark:text-white">
          Quiz
        </h1>
        <button onClick={onCreate} className="text-sm font-medium text-primary-400">
          + New quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState
          icon="🧠"
          title="No quizzes yet"
          description="Generate a quiz from a document or pasted notes."
          action={<Button onClick={onCreate}>Generate a quiz</Button>}
        />
      ) : (
        quizzes.map((quiz) => (
          <Card
            key={quiz.id}
            className="mb-3 !p-4 cursor-pointer"
            onClick={() => onOpenQuiz(quiz)}
          >
            <p className="font-display font-semibold text-slate-800 dark:text-white text-sm">
              {quiz.title}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {quiz.question_count} question{quiz.question_count === 1 ? "" : "s"}
            </p>
          </Card>
        ))
      )}
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Generate quiz — from document or pasted text                 */
/* ---------------------------------------------------------- */
function GenerateQuiz({ session, initialDocId, initialTitle, onGenerated, onCancel, toast }) {
  const [title, setTitle] = useState(initialTitle || "");
  const [mode, setMode] = useState("document");
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
    if (!title.trim()) {
      toast("Give your quiz a name", "error");
      return;
    }
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
          output_type: "quiz",
          count,
          document_id: mode === "document" ? selectedDocId : undefined,
          source_text: mode === "paste" ? pastedText.trim() : undefined,
        },
      }
    );

    if (error || data?.error) {
      setGenerating(false);
      let message = data?.error || error?.message || "Generation failed";
      if (error?.context) {
        try {
          const body = await error.context.json();
          if (body?.error) message = body.error;
        } catch {
          // not JSON, keep fallback
        }
      }
      toast(message, "error");
      return;
    }

    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .insert({ user_id: session.user.id, title: title.trim() })
      .select()
      .single();
    if (quizError) {
      setGenerating(false);
      toast("Could not create quiz", "error");
      return;
    }

    const rows = (data.items || []).map((q) => ({
      quiz_id: quiz.id,
      question: q.question,
      options: q.options,
      correct_index: q.correct_index,
      explanation: q.explanation,
    }));
    const { data: inserted, error: insertError } = await supabase
      .from("quiz_questions")
      .insert(rows)
      .select();
    setGenerating(false);
    if (insertError) {
      toast("Generated, but could not save questions", "error");
      return;
    }
    toast(`Quiz generated with ${inserted.length} questions`, "success");
    onGenerated(quiz, inserted);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display text-lg font-bold text-slate-800 dark:text-white">
          Generate a quiz
        </h1>
      </div>

      <Input
        label="Quiz name"
        placeholder="e.g. Chapter 4 review"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4"
      />

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
          Number of questions
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
/* Take quiz                                                     */
/* ---------------------------------------------------------- */
function TakeQuiz({ questions, onFinish }) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState({}); // { [questionId]: selectedOptionIndex }
  const [finished, setFinished] = useState(false);

  const q = questions[index];
  const isLast = index === questions.length - 1;
  const selected = results[q.id];
  const answered = selected !== undefined;

  const handleSelect = (optIndex) => {
    if (answered) return;
    setResults((prev) => ({ ...prev, [q.id]: optIndex }));
  };

  const handleNext = () => {
    if (isLast) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  const handleBack = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  if (finished) {
    const correctCount = questions.filter(
      (item) => results[item.id] === item.correct_index
    ).length;
    return (
      <div className="animate-fade-in">
        <ResultsRing correct={correctCount} total={questions.length} />
        <Button size="lg" className="w-full" onClick={onFinish}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-slate-400">
          {index + 1} of {questions.length}
        </span>
        <button onClick={onFinish} className="text-sm font-medium text-slate-400">
          End quiz
        </button>
      </div>

      <div className="flex gap-1 mb-5">
        {questions.map((item, i) => {
          let color = "bg-slate-100 dark:bg-slate-700";
          if (i === index) {
            color = "bg-primary-300";
          } else if (results[item.id] !== undefined) {
            color =
              results[item.id] === item.correct_index
                ? "bg-emerald-400"
                : "bg-red-400";
          }
          return <div key={item.id} className={`h-1 flex-1 rounded-full ${color}`} />;
        })}
      </div>

      <p className="font-display font-semibold text-lg text-slate-800 dark:text-white mb-5">
        {q.question}
      </p>

      <div className="mb-5">
        {q.options.map((opt, i) => {
          let style =
            "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800";
          if (answered) {
            if (i === q.correct_index) {
              style = "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20";
            } else if (i === selected) {
              style = "border-red-400 bg-red-50 dark:bg-red-900/20";
            }
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className={`w-full text-left px-4 py-3 rounded-2xl border mb-2 transition-all ${style}`}
            >
              <span className="text-sm font-medium text-slate-800 dark:text-white">
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      {answered && q.explanation && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 mb-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Explanation
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {q.explanation}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        {index > 0 && (
          <Button variant="ghost" size="lg" onClick={handleBack}>
            Back
          </Button>
        )}
        {answered && (
          <Button size="lg" className="flex-1" onClick={handleNext}>
            {isLast ? "See results" : "Next question"}
          </Button>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Root page                                                     */
/* ---------------------------------------------------------- */
export default function Quiz() {
  const { session } = useApp();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [screen, setScreen] = useState(
    location.state?.fromDocumentId ? "create" : "list"
  );
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const incomingDocId = location.state?.fromDocumentId || null;
  const incomingDocName = location.state?.fromDocumentName || "";

  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("quizzes")
      .select("*, quiz_questions(count)")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setQuizzes(
      (data || []).map((q) => ({
        ...q,
        question_count: q.quiz_questions?.[0]?.count || 0,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchQuizzes();
    if (location.state?.fromDocumentId) {
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.user.id]);

  const openQuiz = async (quiz) => {
    const { data } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quiz.id)
      .order("created_at", { ascending: true });
    setActiveQuiz(quiz);
    setQuestions(data || []);
    setScreen("take");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState description={error} onRetry={fetchQuizzes} />;
  }

  return (
    <div className="px-5 pt-6 pb-8">
      {screen === "list" && (
        <QuizList
          quizzes={quizzes}
          onOpenQuiz={openQuiz}
          onCreate={() => setScreen("create")}
        />
      )}

      {screen === "create" && (
        <GenerateQuiz
          session={session}
          initialDocId={incomingDocId}
          initialTitle={
            incomingDocName ? incomingDocName.replace(/\.[^/.]+$/, "") : ""
          }
          onGenerated={(quiz, inserted) => {
            setActiveQuiz(quiz);
            setQuestions(inserted);
            setScreen("take");
            fetchQuizzes();
          }}
          onCancel={() => setScreen("list")}
          toast={toast}
        />
      )}

      {screen === "take" && activeQuiz && questions.length > 0 && (
        <TakeQuiz
          quiz={activeQuiz}
          questions={questions}
          onFinish={() => {
            setScreen("list");
            fetchQuizzes();
          }}
        />
      )}
    </div>
  );
}
