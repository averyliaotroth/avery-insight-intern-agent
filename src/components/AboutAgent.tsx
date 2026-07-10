import { useState } from "react";

export function AboutAgent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[12px] px-3 py-1.5 rounded-full border 
                   border-[var(--harmony)] text-[var(--harmony)] 
                   bg-[var(--card)] hover:bg-[var(--harmony)] 
                   hover:text-white transition-colors"
      >
        How does this work?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-[var(--card)] rounded-[12px] shadow-elevated w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-[6px] bg-insight-gradient" />
            <div className="p-6">
              <h2 className="text-lg font-semibold text-[var(--harmony)] mb-4">
                How this agent works
              </h2>

              <div className="space-y-4 text-[14px] text-[var(--neutral-ink)] leading-relaxed">
                <div>
                  <p className="font-semibold text-[var(--harmony)] mb-1">
                    What is it?
                  </p>
                  <p>
                    This is a full-stack AI portfolio agent built by Avery
                    Liao-Troth as her capstone project during her Account
                    Executive Internship at Insight Enterprises. It is designed
                    to answer questions about her internship experience through
                    natural conversation.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-[var(--harmony)] mb-1">
                    What is RAG?
                  </p>
                  <p>
                    RAG stands for Retrieval-Augmented Generation. Instead of
                    relying on a general AI model to guess answers, this agent
                    first searches a curated knowledge base of real content from
                    Avery's internship. It finds the most relevant entries using
                    semantic search, then passes them to the AI model as context
                    to generate a grounded, accurate response.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-[var(--harmony)] mb-1">
                    Why RAG?
                  </p>
                  <p>
                    Avery chose RAG because it eliminates hallucination — the
                    agent can only answer from what is actually documented. This
                    makes it trustworthy as a portfolio artifact. If the
                    knowledge base does not have an answer, the agent says so
                    honestly rather than inventing one.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-[var(--harmony)] mb-1">
                    The tech stack
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {[
                      "React + Tailwind CSS",
                      "OpenAI gpt-4o-mini",
                      "Supabase pgvector",
                      "RAG Architecture",
                      "Lovable",
                      "TypeScript",
                    ].map((t) => (
                      <span
                        key={t}
                        className="bg-[var(--harmony-lite)] text-[var(--harmony)] 
                                   text-[11px] font-medium px-2 py-0.5 rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="mt-6 w-full py-2 rounded-[8px] border border-[var(--harmony)] 
                           text-[var(--harmony)] text-sm font-medium 
                           hover:bg-[var(--harmony)] hover:text-white transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
