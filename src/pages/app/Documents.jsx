import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import { Skeleton, EmptyState, Button } from "../../components/ui/index";
import * as pdfjs from "pdfjs-dist";
import mammoth from "mammoth";

// Set pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ACCEPTED_TYPES = {
  "application/pdf": { label: "PDF", color: "text-red-500 bg-red-50" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    label: "DOCX",
    color: "text-blue-500 bg-blue-50",
  },
  "text/plain": { label: "TXT", color: "text-slate-500 bg-slate-100" },
};

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Document Viewer ──────────────────────────────────────────────
function DocumentViewer({ doc, signedUrl, onBack }) {
  const [viewMode, setViewMode] = useState("reader"); // reader | original
  const [extractedText, setExtractedText] = useState("");
  const [extracting, setExtracting] = useState(true);
  const [error, setError] = useState(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    extractText();
  }, [doc]);

  const extractText = async () => {
    setExtracting(true);
    setError(null);
    try {
      const response = await fetch(signedUrl);
      const arrayBuffer = await response.arrayBuffer();

      if (doc.file_type === "application/pdf") {
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => item.str).join(" ") + "\n\n";
        }
        setExtractedText(text.trim());
      } else if (
        doc.file_type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const result = await mammoth.extractRawText({ arrayBuffer });
        setExtractedText(result.value.trim());
      } else {
        // Plain text
        const decoder = new TextDecoder("utf-8");
        setExtractedText(decoder.decode(arrayBuffer));
      }
    } catch (err) {
      setError("Could not extract text from this document.");
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surfacedark:bg-slate-900 page-enter">
      {/* Header */}
      <div className="px-5 pt-8 pb-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-primary-400 transition-colors"
        >
          <svg
            width="18"
            height="18"
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
          <span className="text-sm font-medium">Documents</span>
        </button>
      </div>

      {/* Doc title */}
      <div className="px-5 mb-3">
        <h2 className="font-display font-semibold text-slate-800 text-sm leading-snug truncate">
          {doc.filename}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {formatSize(doc.file_size)} · {formatDate(doc.created_at)}
        </p>
      </div>

      {/* View mode toggle */}
      <div className="px-5 mb-4">
        <div className="flex bg-primary-50 dark:bg-slate-800 rounded-2xl p-1 gap-1">
          {["reader", "original"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all capitalize
                ${
                  viewMode === mode
                    ? "bg-white dark:bg-slate-700  text-primary-500 shadow-card"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
            >
              {mode === "reader" ? "📖 Reader mode" : "📄 Original view"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-32 overflow-y-auto">
        {viewMode === "reader" ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-card p-6">
            {extracting ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                {extractedText.split("\n\n").map((para, i) =>
                  para.trim() ? (
                    <p
                      key={i}
                      className="text-slate-700 dark:text-slate-300 text-sm leading-7 font-body mb-4 last:mb-0"
                    >
                      {para.trim()}
                    </p>
                  ) : null
                )}
              </div>
            )}
          </div>
        ) : (
          <div
            className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-card overflow-hidden"
            style={{ height: "70vh" }}
          >
            {doc.file_type === "application/pdf" ? (
              <iframe
                src={`${signedUrl}#toolbar=0`}
                className="w-full h-full"
                title={doc.filename}
              />
            ) : doc.file_type === "text/plain" ? (
              <pre
                className="p-6 text-xs text-slate-700 leading-relaxed
                overflow-auto h-full whitespace-pre-wrap font-body"
              >
                {extractedText}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
                <div
                  className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center
                  justify-center text-blue-500 font-display font-bold text-lg"
                >
                  W
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 text-center font-medium">
                  Word documents can't be previewed directly
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
                  Use Reader mode to read the content, or download the file.
                </p>
                <a
                  href={signedUrl}
                  download={doc.filename}
                  className="bg-primary-400 text-white text-sm font-medium px-6 py-2.5
                    rounded-2xl transition-all active:scale-95 hover:bg-primary-500"
                >
                  Download file
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      {/* Floating actions button */}
      <div className="fixed bottom-24 right-5 z-40">
        <button
          onClick={() => setActionsOpen((prev) => !prev)}
          className="flex items-center gap-2 bg-primary-400 text-white
      px-4 py-2.5 rounded-full shadow-glow text-xs font-medium
      transition-all active:scale-95 hover:bg-primary-500"
        >
          <svg
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Actions
        </button>
      </div>

      {/* Actions sheet */}
      {actionsOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 animate-fade-in"
            onClick={() => setActionsOpen(false)}
          />

          {/* Sheet */}
          <div
            className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100vw-40px)] max-w-[calc(448px-40px)]
  bg-white dark:bg-slate-800 rounded-3xl z-50 px-5 pt-5 pb-6 shadow-glow
  border border-slate-100 dark:border-slate-700
  animate-[slideUpSheet_0.35s_cubic-bezier(0.32,0.72,0,1)_both]"
          >
            {/* Handle */}
            <div className="w-8 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Document actions
            </p>

            <div className="flex flex-col gap-2">
              {/* View — active */}
              <button
                onClick={() => setActionsOpen(false)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-primary-50 dark:bg-primary-900/20
    border border-primary-100 dark:border-primary-900/30 transition-all active:scale-[0.99]"
              >
                <div
                  className="w-10 h-10 rounded-xl bg-primary-400 flex items-center
            justify-center text-white shrink-0"
                >
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                    View document
                  </p>
                  <p className="text-xs text-primary-400 dark:text-primary-500 mt-0.5">
                    Currently active
                  </p>
                </div>
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#7C6FF7"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>

              {/* Quiz — coming soon */}
              <div
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50
  border border-slate-100 dark:border-slate-700 opacity-60"
              >
                <div
                  className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-600 flex items-center
    justify-center text-slate-400 dark:text-slate-500 shrink-0"
                >
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Generate quiz
                    </p>
                    <span
                      className="text-[10px] font-medium bg-amber-100 text-amber-600
                px-2 py-0.5 rounded-full"
                    >
                      Coming soon
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    AI-powered from your document
                  </p>
                </div>
              </div>

              {/* Flashcards — coming soon */}
              <div
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50
          border border-slate-100 opacity-60"
              >
                <div
                  className="w-10 h-10 rounded-xl bg-slate-200 flex items-center
            justify-center text-slate-400 shrink-0"
                >
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-500">
                      Generate flashcards
                    </p>
                    <span
                      className="text-[10px] font-medium bg-amber-100 text-amber-600
                px-2 py-0.5 rounded-full"
                    >
                      Coming soon
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Study cards from your document
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Document Card ──────────────────────────────────────────────
function DocumentCard({ doc, onOpen, onDelete }) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const typeInfo = ACCEPTED_TYPES[doc.file_type] || {
    label: "FILE",
    color: "text-slate-500 bg-slate-100",
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-4">
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center
  shrink-0 font-display font-bold text-xs ${typeInfo.color}`}
        >
          {typeInfo.label}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-snug truncate">
            {doc.filename}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {formatSize(doc.file_size)} · {formatDate(doc.created_at)}
          </p>
        </div>
        <button
          onClick={() => setDeleteConfirm(true)}
          className="w-7 h-7 rounded-lg flex items-center justify-center
            text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all shrink-0"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {!deleteConfirm ? (
        <button
          onClick={() => onOpen(doc)}
          className="mt-3 w-full flex items-center justify-center gap-2
    bg-primary-50 dark:bg-primary-900/20 text-primary-500 dark:text-primary-400 
    text-xs font-medium py-2.5 rounded-xl transition-all active:scale-[0.99] 
    hover:bg-primary-100 dark:hover:bg-primary-900/30"
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          Open document
        </button>
      ) : (
        <div className="mt-3 bg-red-50 rounded-xl p-3">
          <p className="text-xs font-medium text-red-700 mb-2">
            Delete this document?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setDeleteConfirm(false)}
              className="flex-1 py-1.5 rounded-lg border border-slate-200
                text-xs font-medium text-slate-500 transition-all hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onDelete(doc)}
              className="flex-1 py-1.5 rounded-lg bg-red-500 text-white
                text-xs font-medium transition-all hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Documents Page ──────────────────────────────────────────────
export default function Documents() {
  const { session } = useApp();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [signedUrl, setSignedUrl] = useState(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setDocuments(data || []);
    setLoading(false);
  };

  const handleFile = async (file) => {
    if (!file) return;

    const acceptedMimes = Object.keys(ACCEPTED_TYPES);
    if (!acceptedMimes.includes(file.type)) {
      toast("Only PDF, Word (.docx), and text files are supported", "error");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast("File must be under 50MB", "error");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate progress since Supabase doesn't expose upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 85) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    const filePath = `${session.user.id}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    clearInterval(progressInterval);

    if (uploadError) {
      setUploading(false);
      setUploadProgress(0);
      toast(uploadError.message || "Upload failed", "error");
      return;
    }

    setUploadProgress(100);

    // Save to documents table
    const { data, error: dbError } = await supabase
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

    setTimeout(() => {
      setUploading(false);
      setUploadProgress(0);
    }, 600);

    if (dbError) {
      toast("File uploaded but could not save record", "error");
      return;
    }

    setDocuments((prev) => [data, ...prev]);
    toast("Document uploaded successfully", "success");
  };

  const handleOpen = async (doc) => {
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.file_path, 3600); // 1 hour
    if (error) {
      toast("Could not open document", "error");
      return;
    }
    setSignedUrl(data.signedUrl);
    setViewingDoc(doc);
  };

  const handleDelete = async (doc) => {
    await supabase.storage.from("documents").remove([doc.file_path]);
    await supabase.from("documents").delete().eq("id", doc.id);
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    toast("Document deleted", "success");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  if (viewingDoc && signedUrl) {
    return (
      <DocumentViewer
        doc={viewingDoc}
        signedUrl={signedUrl}
        onBack={() => {
          setViewingDoc(null);
          setSignedUrl(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surfacedark:bg-slate-900 page-enter">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <h1 className="font-display text-xl font-bold text-slate-800">
          Documents
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {documents.length} {documents.length === 1 ? "document" : "documents"}{" "}
          uploaded
        </p>
      </div>

      {/* Upload area */}
      <div className="px-5 mb-5">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center
    justify-center text-center cursor-pointer transition-all duration-200
            ${
              dragging
                ? "border-primary-400 bg-primary-50 dark:bg-primary-900/20"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-slate-700"
            }
            ${uploading ? "cursor-not-allowed opacity-70" : ""}`}
        >
          {uploading ? (
            <div className="w-full">
              <div
                className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center
                justify-center mx-auto mb-4"
              >
                <svg
                  className="animate-spin text-primary-400"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-3">
                Uploading…
              </p>
              <div className="w-full bg-primary-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {Math.round(uploadProgress)}%
              </p>
            </div>
          ) : (
            <>
              <div
                className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center
                justify-center mb-4 text-primary-400"
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                Tap to upload or drag and drop
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                PDF, Word (.docx), or plain text · Max 50MB
              </p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={(e) => handleFile(e.target.files[0])}
          className="hidden"
        />
      </div>

      {/* Document list */}
      <div className="px-5 pb-8 flex flex-col gap-3">
        {loading && (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        )}

        {!loading && error && (
          <div className="text-center py-8">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={fetchDocuments}
              className="mt-3 text-sm text-primary-400 font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && documents.length === 0 && (
          <EmptyState
            icon={
              <svg
                width="28"
                height="28"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
            title="No documents yet"
            description="Upload your lecture notes, textbooks or assignments to get started."
          />
        )}

        {!loading &&
          !error &&
          documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onOpen={handleOpen}
              onDelete={handleDelete}
            />
          ))}
      </div>
    </div>
  );
}
