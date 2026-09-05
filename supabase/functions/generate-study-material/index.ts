// supabase/functions/generate-study-material/index.ts
//
// Shared generator used by both the Flashcards and Quiz features.
// Accepts either an existing uploaded document (PDF or TXT) or pasted text,
// sends it to Gemini with a structured JSON schema, and returns the result.
//
// Required secret (set via Supabase dashboard or CLI, never in client code):
//   GEMINI_API_KEY

import { createClient } from "npm:@supabase/supabase-js@2";
import { encodeBase64 } from "jsr:@std/encoding/base64";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FLASHCARD_SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      front: { type: "STRING" },
      back: { type: "STRING" },
    },
    required: ["front", "back"],
  },
};

const QUIZ_SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      question: { type: "STRING" },
      options: { type: "ARRAY", items: { type: "STRING" } },
      correct_index: { type: "INTEGER" },
      explanation: { type: "STRING" },
    },
    required: ["question", "options", "correct_index", "explanation"],
  },
};

function promptFor(outputType, count) {
  if (outputType === "flashcards") {
    return `You are creating study flashcards from the attached source material.
Generate exactly ${count} flashcards covering the most important concepts, terms, and facts.
Each flashcard's "front" should be a concise question or term, and "back" should be a clear, complete answer.
Do not include flashcards about material not present in the source.`;
  }
  return `You are creating a multiple-choice quiz from the attached source material.
Generate exactly ${count} questions covering the most important concepts.
Each question needs exactly 4 options, a correct_index (0-3) pointing to the right one, and a short explanation of why it's correct.
Do not include questions about material not present in the source.`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Client scoped to the requesting user's JWT, so RLS applies —
    // they can only ever generate from their own documents.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_ANON_KEY"),
      { global: { headers: { Authorization: authHeader } } }
    );

    const body = await req.json();
    const { output_type, count = 10, document_id, source_text } = body;

    if (!["flashcards", "quiz"].includes(output_type)) {
      return new Response(
        JSON.stringify({ error: "output_type must be 'flashcards' or 'quiz'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!document_id && !source_text) {
      return new Response(
        JSON.stringify({ error: "Provide either document_id or source_text" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parts = [{ text: promptFor(output_type, count) }];

    if (document_id) {
      const { data: doc, error: docError } = await supabase
        .from("documents")
        .select("file_path, file_type, filename")
        .eq("id", document_id)
        .single();

      if (docError || !doc) {
        return new Response(
          JSON.stringify({ error: "Document not found or not accessible" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (
        doc.file_type !== "application/pdf" &&
        doc.file_type !== "text/plain"
      ) {
        return new Response(
          JSON.stringify({
            error:
              "Only PDF and TXT documents can be used for generation right now. Try re-exporting as PDF, or paste the text directly.",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: fileBlob, error: downloadError } = await supabase.storage
        .from("documents")
        .download(doc.file_path);

      if (downloadError || !fileBlob) {
        return new Response(
          JSON.stringify({ error: "Could not read document from storage" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (doc.file_type === "application/pdf") {
        const bytes = new Uint8Array(await fileBlob.arrayBuffer());
        const base64 = encodeBase64(bytes);
        parts.push({ inline_data: { mime_type: "application/pdf", data: base64 } });
      } else {
        const text = await fileBlob.text();
        parts.push({ text: `\n\nSource material (${doc.filename}):\n${text}` });
      }
    } else {
      parts.push({ text: `\n\nSource material:\n${source_text}` });
    }

    const schema = output_type === "flashcards" ? FLASHCARD_SCHEMA : QUIZ_SCHEMA;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini error:", errText);
      if (geminiRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached — wait a minute and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      // Surface the real Gemini error text rather than a generic message —
      // this is what actually tells us what's wrong (bad model name, bad key, bad request shape, etc.)
      let detail = errText;
      try {
        const parsed = JSON.parse(errText);
        detail = parsed?.error?.message || errText;
      } catch {
        // errText wasn't JSON, use it raw
      }
      return new Response(
        JSON.stringify({ error: `Gemini request failed: ${detail}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiRes.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return new Response(
        JSON.stringify({ error: "Gemini returned no usable content" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const items = JSON.parse(text);

    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
