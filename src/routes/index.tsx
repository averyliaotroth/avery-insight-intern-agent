import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { chatWithAgent } from "@/lib/chat.functions";
import { categoryPillClass } from "@/lib/categoryColors";
import { exportChatAsPDF } from "@/lib/exportChat";

export const Route = createFileRoute("/")({
  component: ChatPage,
});

type Message = {
  id: string;
  role: "user" | "agent";
  text: string;
  category?: string | null;
  timestamp: Date;
  welcome?: boolean;
  chunksUsed?: number;
  sources?: { category: string; title: string; similarity?: number }[];
  followUpQuestions?: string[];
  responseTime?: number;
};

const ALL_SUGGESTIONS = [
  "What account did she support this summer?",
  "What was her role on the account team?",
  "What were her most meaningful experiences?",
  "How did she contribute to sales impact?",
  "What tools and AI did she use?",
  "What outcomes did she deliver?",
  "Why did she build this portfolio agent?",
  "What did she learn from her internship?",
  "How does she approach strategic research?",
  "What is her career direction?",
  "How did she use AI in her work?",
  "What makes her background distinctive?",
];

const WELCOME_TIMESTAMP = new Date(0);

const WELCOME: Message = {
  id: "welcome",
  role: "agent",
  text: "Hi! I'm an AI agent built by Avery Liao-Troth as her capstone project during her Account Executive Internship at Insight. She conceptualized, designed, and deployed me to explore AI product development firsthand, from defining requirements and architecting a solution to building, iterating, and shipping a working product. Ask me about her experience, her process, or what she learned along the way.",
  timestamp: WELCOME_TIMESTAMP,
  welcome: true,
};

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function ChatPage() {
  const chat = useServerFn(chatWithAgent);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const [shownQuestions, setShownQuestions] = useState<Set<string>>(new Set());

  const [suggestions] = useState(() =>
    [...ALL_SUGGESTIONS]
      .sort(() => Math.random() - 0.5)
      .slice(0, 6)
  );

  const [welcomeText] = useState(() => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning!" : hour < 17 ? "Good afternoon!" : "Good evening!";
    return `${greeting} I'm an AI agent built by Avery Liao-Troth as her capstone project during her Account Executive Internship at Insight. She conceptualized, designed, and deployed me to explore AI product development firsthand, from defining requirements and architecting a solution to building, iterating, and shipping a working product. Ask me about her experience, her process, or what she learned along the way.`;
  });

  function toggleSources(id: string) {
    setExpandedSources(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  const sessionIdRef = useRef<string>("");
    useEffect(() => {
      if (!sessionIdRef.current) {
        sessionIdRef.current = typeof crypto !== "undefined" 
          ? crypto.randomUUID() 
          : `s-${Date.now()}`;
      }
    }, []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const animatingIdRef = useRef<string | null>(null);
  const animatingTextRef = useRef<string>("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [typedLen, setTypedLen] = useState(0);

  function finishAnimation() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (animatingIdRef.current) {
      animatingIdRef.current = null;
      setTypedLen(animatingTextRef.current.length);
    }
  }

  function startTypewriter(id: string, fullText: string) {
    finishAnimation();
    animatingIdRef.current = id;
    animatingTextRef.current = fullText;
    setTypedLen(0);
    const cps = 30;
    const charsPerTick = 2;
    intervalRef.current = setInterval(() => {
      setTypedLen((prev) => {
        const next = prev + charsPerTick;
        if (next >= fullText.length) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          animatingIdRef.current = null;
          return fullText.length;
        }
        return next;
      });
    }, 1000 / cps);
  }

  useEffect(() => () => finishAnimation(), []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, typedLen]);

  useEffect(() => {
    messages.forEach(m => {
      if (m.followUpQuestions && m.followUpQuestions.length > 0) {
        setShownQuestions(prev => {
          const next = new Set(prev);
          m.followUpQuestions!.forEach(q => next.add(q));
          return next;
        });
      }
    });
  }, [messages]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || loading) return;
    finishAnimation();
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text: message,
      timestamp: new Date(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const history = messages
        .filter(m => !m.welcome)
        .slice(-6)
        .map(m => ({
          role: m.role === "user" 
            ? "user" as const 
            : "assistant" as const,
          content: m.text,
        }));
      
      const startTime = Date.now();
      const res = await chat({ 
        data: { 
          message, 
          sessionId: sessionIdRef.current,
          history,
        } 
      });
      const responseTime = ((Date.now() - startTime) / 1000);
      const agentId = `a-${Date.now()}`;

      setMessages((m) => [
        ...m,
        {
          id: agentId,
          role: "agent",
          text: res.reply,
          category: res.chunksUsed > 0 ? res.categoryTag : null,
          timestamp: new Date(),
          chunksUsed: res.chunksUsed,
          sources: (res.sources ?? []).map(s => ({
            category: s.category,
            title: s.title,
            similarity: s.similarity,
          })),
          followUpQuestions: res.followUpQuestions ?? [],
          responseTime,
        },
      ]);
      startTypewriter(agentId, res.reply);

    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      toast.error(msg);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const charCount = input.length;

  return (
    <div className="mx-auto max-w-5xl px-2 min-[380px]:px-4 sm:px-6 pt-8 pb-32 sm:pb-8">
      <section className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--harmony)]">
          Ask me anything about my internship at Insight
        </h1>
        <p className="mt-3 text-[var(--muted-foreground)] max-w-2xl mx-auto text-[15px]">
          I'm an AI agent trained on Avery's real work, research, and reflections
          from her Account Executive Internship at Insight.
        </p>
        {messages.length > 1 && (
          <div className="mt-3 flex flex-col min-[400px]:flex-row items-stretch min-[400px]:items-center justify-center gap-2">
            <button
              onClick={() => {
                const text = messages
                  .filter(m => !m.welcome)
                  .map(m =>
                    `${m.role === "user" ? "You" : "Avery's Agent"}: ${m.text}`
                  )
                  .join("\n\n");
                navigator.clipboard.writeText(text);
                toast.success("Conversation copied to clipboard");
              }}
              className="text-[12px] px-3 py-1.5 rounded-full border 
                border-[var(--harmony)] text-[var(--harmony)] 
                bg-[var(--card)] hover:bg-[var(--harmony)] 
                hover:text-white transition-colors"
            >
              Copy conversation
            </button>
        
            <button
              onClick={() =>
                exportChatAsPDF(
                  messages
                    .filter(m => !m.welcome)
                    .map(m => ({
                      role: m.role === "user" ? "user" : "assistant",
                      content: m.text,
                    }))
                )
              }
              className="text-[12px] px-3 py-1.5 rounded-full border 
                border-[var(--harmony)] text-[var(--harmony)] 
                bg-[var(--card)] hover:bg-[var(--harmony)] 
                hover:text-white transition-colors"
            >
              Export PDF
            </button>
          </div>
        )}
      </section>


      <div className="bg-[var(--card)] rounded-[12px] shadow-card overflow-hidden flex flex-col">
        <div ref={scrollRef} className="px-4 sm:px-6 py-5 space-y-4 max-h-[55vh] overflow-y-auto">
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[95%] sm:max-w-[80%]">

                  <div className="bg-[var(--hunger)] text-white rounded-[12px] px-4 py-2.5 text-[15px] leading-relaxed">
                    {m.text}
                  </div>
                  <div
                    className="mt-1 text-[11px] text-[var(--muted-foreground)] text-right"
                    suppressHydrationWarning
                  >
                    {formatTime(m.timestamp)}
                  </div>
                </div>
              </div>
            ) : (() => {
              const isAnimating = animatingIdRef.current === m.id;
              const text = m.welcome ? welcomeText : m.text;
              const displayText = isAnimating ? text.slice(0, typedLen) : text;
              return (
              <div key={m.id} className="flex gap-3">
                <img
                  src="https://raw.githubusercontent.com/averyliaotroth/avery-insight-intern-agent/main/public/avery-headshot.jpeg"
                  alt="Avery"
                  className="shrink-0 w-8 h-8 rounded-full object-cover ring-1 ring-[var(--harmony)]"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="max-w-[95%] sm:max-w-[85%] min-w-0">
                  <div
                    className={`rounded-[12px] px-4 py-2.5 text-[15px] leading-relaxed border border-[var(--border)] text-[var(--neutral-ink)] whitespace-pre-wrap ${
                      m.welcome ? "bg-[var(--harmony-lite)]" : "bg-[var(--card)]"
                    }`}
                  >
                    {displayText}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    {!isAnimating && m.category && (
                      <span
                        className={`${categoryPillClass(m.category)} text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap`}
                      >
                        {m.category}
                      </span>
                    )}
                    {!isAnimating && m.chunksUsed !== undefined && m.chunksUsed > 0 && !m.text.includes("I don't have specific information") && (
                      <div className="mt-1">
                        <button
                          onClick={() => toggleSources(m.id)}
                          className="text-[10px] text-[var(--muted-foreground)] italic 
                                     hover:text-[var(--harmony)] transition-colors flex 
                                     items-center gap-1"
                        >
                          {m.chunksUsed} source{m.chunksUsed !== 1 ? "s" : ""} retrieved
                          <span>{expandedSources.has(m.id) ? "▲" : "▼"}</span>
                        </button>
                    
                        {expandedSources.has(m.id) && m.sources && m.sources.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {m.sources.map((source, i) => (
                              <span
                                key={i}
                                className={`${categoryPillClass(source.category)} text-[10px] 
                                            font-medium px-2 py-0.5 rounded-full uppercase 
                                            tracking-wide whitespace-nowrap`}
                              >
                                {source.title}
                                {source.similarity !== undefined && (
                                  <span className="ml-1 opacity-60">
                                    {Math.round(source.similarity * 100)}%
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {!isAnimating && !m.welcome &&
                      m.followUpQuestions &&
                      m.followUpQuestions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {m.followUpQuestions.map((q, i) => (
                            <button
                              key={i}
                              onClick={() => send(q)}
                              disabled={loading}
                              className="text-[12px] px-3 py-1.5 rounded-full border 
                                         border-[var(--harmony)] text-[var(--harmony)] 
                                         bg-[var(--card)] hover:bg-[var(--harmony)] 
                                         hover:text-white disabled:opacity-50 
                                         transition-colors text-left"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      )}
                    <span
                      className="text-[11px] text-[var(--muted-foreground)]"
                      suppressHydrationWarning
                    >
                      {formatTime(m.timestamp)}
                    </span>
                    {m.responseTime !== undefined && !m.welcome && (
                      <span className="text-[10px] text-[var(--muted-foreground)] opacity-60">
                        {m.responseTime.toFixed(1)} seconds
                      </span>
                    )}
                </div>
                </div>
              </div>
              );
            })(),
          )}
          {loading && (
            <div className="flex gap-3">
              <img
                src="https://raw.githubusercontent.com/averyliaotroth/avery-insight-intern-agent/main/public/avery-headshot.jpeg"
                alt="Avery"
                className="shrink-0 w-8 h-8 rounded-full object-cover ring-1 ring-[var(--harmony)]"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] px-4 py-3 flex items-center gap-1.5">
                <span className="typing-dot inline-block w-2 h-2 rounded-full bg-[var(--hunger)]" />
                <span className="typing-dot inline-block w-2 h-2 rounded-full bg-[var(--hunger)]" />
                <span className="typing-dot inline-block w-2 h-2 rounded-full bg-[var(--hunger)]" />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-[var(--border)] p-3 sm:p-4 space-y-3">
          <div className="flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible pb-1 -mx-1 px-1">
            {suggestions.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                disabled={loading}
                className="shrink-0 text-[13px] px-3 py-1.5 rounded-full border border-[var(--harmony)] text-[var(--harmony)] bg-[var(--card)] hover:bg-[var(--harmony)] hover:text-white disabled:opacity-50 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex items-end gap-2 bg-[var(--clarity)] rounded-full pl-5 pr-1.5 py-1.5 border border-[var(--border)] focus-within:border-[var(--hunger)]">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about my internship experience..."
              className="flex-1 bg-transparent resize-none outline-none text-[15px] py-2 placeholder:text-[var(--muted-foreground)] max-h-32"
              disabled={loading}
            />
            <button
              onClick={() => send(input)}
              disabled={loading || input.trim().length === 0}
              className="bg-insight-gradient text-white w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 hover:scale-105 transition-transform shrink-0"
              aria-label="Send"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          {charCount >= 200 && (
            <div className="text-right text-[11px] text-[var(--muted-foreground)]">
              {charCount} characters
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
