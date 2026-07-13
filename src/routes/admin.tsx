import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Pencil, Trash2, Plus, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";
import { listEntries, upsertEntry, deleteEntry } from "@/lib/knowledge.functions";
import { backfillEmbeddings, countMissingEmbeddings } from "@/lib/backfill";

const analyticsSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

type AnalyticsRow = {
  id: string;
  session_id: string | null;
  user_message: string | null;
  knowledge_chunks_used: string[] | null;
  created_at: string;
  agent_response: string | null;
};

type DateRange = "7d" | "30d" | "All";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · Avery Liao-Troth" }] }),
  component: AdminPage,
});

const CATEGORIES = [
  "Account Overview",
  "My Role",
  "Key Experiences",
  "Sales Thinking & Impact",
  "Tools, Tech, & AI",
  "Outcomes & Future State",
  "Growth & Learnings",
  "Looking Forward",
  "Research",
  "This Agent",
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  "Account Overview":
    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  "My Role":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  "Key Experiences":
    "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  "Sales Thinking & Impact":
    "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  "Tools, Tech, & AI":
    "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
  "Outcomes & Future State":
    "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900 dark:text-fuchsia-300",
  "Growth & Learnings":
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  "Looking Forward":
    "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  "Research":
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
  "This Agent":
    "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
};

function categoryPillClass(category: string): string {
  return (
    CATEGORY_COLORS[category] ??
    "bg-[var(--harmony-lite)] text-[var(--harmony)]"
  );
}

export { categoryPillClass, CATEGORY_COLORS };

type Entry = {
  id: string;
  category: string;
  title: string;
  content: string;
  week_number: number | null;
  tags: string[] | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

const AUTH_KEY = "insight_admin_auth";

// ─── AdminPage — handles login gate only ──────────────────────────────────────
function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(AUTH_KEY) === "1") setAuthed(true);
  }, []);

  function tryLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pwd === "112897") {
      localStorage.setItem(AUTH_KEY, "1");
      setAuthed(true);
    } else {
      toast.error("Incorrect password");
    }
  }

  if (!authed) {
    // ← RESTORED: original login card, untouched
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="bg-[var(--card)] rounded-[12px] shadow-elevated w-full max-w-sm overflow-hidden">
          <div className="h-[6px] bg-insight-gradient" />
          <form onSubmit={tryLogin} className="p-7">
            <h1 className="text-xl font-semibold text-[var(--harmony)]">Admin access</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Enter the admin password to manage the knowledge base.
            </p>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="Password"
              className="mt-5 w-full px-4 py-2.5 rounded-[8px] border border-[var(--border)] outline-none focus:border-[var(--hunger)] bg-[var(--card)] text-[var(--foreground)]"
              autoFocus
            />
            <button
              type="submit"
              className="mt-4 w-full bg-insight-gradient text-white font-medium py-2.5 rounded-[8px] hover:opacity-95"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <KnowledgeManager onLogout={() => { localStorage.removeItem(AUTH_KEY); setAuthed(false); }} />;
}

type FormState = {
  id?: string;
  category: string;
  title: string;
  content: string;
  week_number: string;
  tagsInput: string;
  is_featured: boolean;
  question: string;
};

function emptyForm(): FormState {
  return {
    category: CATEGORIES[0],
    title: "",
    content: "",
    week_number: "",
    tagsInput: "",
    is_featured: false,
    question: "",
  };
}

// ─── KnowledgeManager — full admin UI with tabs ───────────────────────────────
function KnowledgeManager({ onLogout }: { onLogout: () => void }) {
  const list = useServerFn(listEntries);
  const upsert = useServerFn(upsertEntry);
  const del = useServerFn(deleteEntry);
  const backfill = useServerFn(backfillEmbeddings);
  const countMissing = useServerFn(countMissingEmbeddings);

  // ← NEW: tab state lives here, in KnowledgeManager
  const [activeTab, setActiveTab] = useState<"kb" | "analytics">("kb");

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState<string>("All");
  const [filterWeek, setFilterWeek] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [previewEntry, setPreviewEntry] = useState<Entry | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [missingCount, setMissingCount] = useState(0);
  const [backfilling, setBackfilling] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsRow[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  async function refresh() {
    setLoading(true);
    try {
      const data = await list({ data: {} });
      setEntries(data as Entry[]);
      try {
        const c = await countMissing();
        setMissingCount(c.count);
      } catch {
        // non-fatal
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function loadAnalytics() {
    setAnalyticsLoading(true);
    try {
      const { data, error } = await analyticsSupabase
        .from("conversation_logs")
        .select("id, session_id, user_message, knowledge_chunks_used, created_at, agent_response");
      if (!error && data) setAnalyticsData(data as AnalyticsRow[]);
    } catch {
      // silent
    } finally {
      setAnalyticsLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!previewEntry) {
      setSummary([]);
      setSummaryLoading(false);
      return;
    }
    setSummaryLoading(true);
    setSummary([]);
    summarize({ data: { content: previewEntry.content } })
      .then((res) => setSummary(res.bullets ?? []))
      .catch(() => setSummary([]))
      .finally(() => setSummaryLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewEntry?.id]);

  const filteredAnalytics = useMemo(() => {
    if (dateRange === "All") return analyticsData;
    const days = dateRange === "7d" ? 7 : 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return analyticsData.filter((r) => new Date(r.created_at).getTime() >= cutoff);
  }, [analyticsData, dateRange]);

  const stats = useMemo(() => {
    const sessions = new Set<string>();
    filteredAnalytics.forEach((r) => {
      if (r.session_id) sessions.add(r.session_id);
    });
    const totalMessages = filteredAnalytics.length;

    const catCounts = new Map<string, number>();
    const chunkCounts = new Map<string, number>();
    filteredAnalytics.forEach((r) => {
      (r.knowledge_chunks_used ?? []).forEach((s) => {
        if (!s) return;
        chunkCounts.set(s, (chunkCounts.get(s) ?? 0) + 1);
        const cat = s.split(": ")[0];
        if (cat) catCounts.set(cat, (catCounts.get(cat) ?? 0) + 1);
      });
    });
    let topCat = "—";
    let topCatN = 0;
    catCounts.forEach((n, k) => {
      if (n > topCatN) {
        topCatN = n;
        topCat = k;
      }
    });

    const respLens = filteredAnalytics
      .map((r) => (r.agent_response ?? "").length)
      .filter((n) => n > 0);
    const avgLen = respLens.length
      ? Math.round(respLens.reduce((a, b) => a + b, 0) / respLens.length)
      : 0;

    const topChunks = Array.from(chunkCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const qCounts = new Map<string, number>();
    filteredAnalytics.forEach((r) => {
      const q = (r.user_message ?? "").trim();
      if (q) qCounts.set(q, (qCounts.get(q) ?? 0) + 1);
    });
    const topQuestions = Array.from(qCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const dayCounts = new Map<string, Set<string>>();
    filteredAnalytics.forEach((r) => {
      const day = r.created_at.slice(0, 10);
      if (!dayCounts.has(day)) dayCounts.set(day, new Set());
      if (r.session_id) dayCounts.get(day)!.add(r.session_id);
    });
    const days = Array.from(dayCounts.entries())
      .map(([d, s]) => ({ day: d, count: s.size }))
      .sort((a, b) => a.day.localeCompare(b.day));

    return {
      totalConversations: sessions.size,
      totalMessages,
      topCategory: topCat,
      avgLen,
      topChunks,
      topQuestions,
      days,
    };
  }, [filteredAnalytics]);

  const maxDay = Math.max(1, ...stats.days.map((d) => d.count));

  async function runBackfill() {
    setBackfilling(true);
    try {
      const res = await backfill();
      if (res.failed > 0) {
        toast.success(`${res.processed} succeeded, ${res.failed} failed`);
      } else {
        toast.success(`Generated embeddings for ${res.processed} entries`);
      }
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Backfill failed");
    } finally {
      setBackfilling(false);
    }
  }

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return entries.filter(
      (e) =>
        (filterCat === "All" || e.category === filterCat) &&
        (filterWeek === "All" || String(e.week_number ?? "") === filterWeek) &&
        (!q ||
          e.title.toLowerCase().includes(q) ||
          e.content.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.tags ?? []).some((t) => t.toLowerCase().includes(q))),
    );
  }, [entries, filterCat, filterWeek, searchQuery]);

  function openNew() {
    setForm(emptyForm());
    setShowForm(true);
  }

  function openEdit(e: Entry) {
    setForm({
      id: e.id,
      category: e.category,
      title: e.title,
      content: e.content,
      week_number: e.week_number ? String(e.week_number) : "",
      tagsInput: e.tags?.join(", ") ?? "",
      is_featured: e.is_featured,
      question: (e as any).question ?? "",
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setSaving(true);
    try {
      const tags = form.tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const week = form.week_number ? parseInt(form.week_number, 10) : null;
      await upsert({
        data: {
          password: "insight2026",
          id: form.id,
          category: form.category,
          title: form.title.trim(),
          content: form.content.trim(),
          week_number: week,
          tags: tags.length ? tags : null,
          is_featured: form.is_featured,
          question: form.question.trim() || null,
        },
      });
      toast.success(form.id ? "Entry updated" : "Entry created");
      setShowForm(false);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    try {
      await del({ data: { password: "insight2026", id } });
      toast.success("Deleted");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">

      {/* ── TAB BUTTONS — new, lives at top of KnowledgeManager ── */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("kb")}
          className={`px-4 py-2 rounded-[8px] text-sm font-medium transition-colors ${
            activeTab === "kb"
              ? "bg-[var(--harmony)] text-white"
              : "border border-[var(--harmony)] text-[var(--harmony)] bg-transparent hover:bg-[var(--harmony-lite)]"
          }`}
        >
          Knowledge Base
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 rounded-[8px] text-sm font-medium transition-colors ${
            activeTab === "analytics"
              ? "bg-[var(--harmony)] text-white"
              : "border border-[var(--harmony)] text-[var(--harmony)] bg-transparent hover:bg-[var(--harmony-lite)]"
          }`}
        >
          Analytics
        </button>
      </div>

      {/* ── ANALYTICS TAB ── */}
      {activeTab === "analytics" && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--harmony)]">Analytics</h2>
            <div className="flex gap-2">
              {(["7d", "30d", "All"] as DateRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={
                    dateRange === r
                      ? "bg-[var(--harmony)] text-white rounded-full px-3 py-1 text-xs"
                      : "border border-[var(--harmony)] text-[var(--harmony)] bg-transparent rounded-full px-3 py-1 text-xs"
                  }
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {[
              { n: stats.totalConversations, l: "Total Conversations" },
              { n: stats.totalMessages, l: "Total Messages" },
              { n: stats.topCategory, l: "Most Asked Topic" },
              { n: `${stats.avgLen} chars`, l: "Avg Response Length" },
            ].map((c) => (
              <div key={c.l} className="bg-[var(--card)] rounded-[12px] shadow-card p-4">
                <div className="text-2xl font-bold text-[var(--harmony)]">
                  {analyticsLoading ? "..." : c.n}
                </div>
                <div className="text-xs text-[var(--muted-foreground)] mt-1">{c.l}</div>
              </div>
            ))}
          </div>

          <div className="bg-[var(--card)] rounded-[12px] shadow-card p-4 mb-4">
            <div className="text-xs font-medium text-[var(--muted-foreground)] mb-3">
              Conversations over time
            </div>
            <div className="flex items-end gap-1 h-20">
              {stats.days.map((d) => (
                <div
                  key={d.day}
                  className="bg-[var(--harmony)] opacity-70 rounded-sm min-h-[2px] flex-1"
                  style={{ height: `${(d.count / maxDay) * 100}%` }}
                  title={`${d.day}: ${d.count}`}
                />
              ))}
            </div>
            <div className="flex gap-1 mt-1">
              {stats.days.map((d) => (
                <div
                  key={d.day}
                  className="text-[9px] text-[var(--muted-foreground)] text-center flex-1 truncate"
                >
                  {d.day.slice(5)}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-[var(--card)] rounded-[12px] shadow-card p-4">
              <div className="text-sm font-semibold text-[var(--harmony)] mb-3">
                Most Retrieved Entries
              </div>
              {stats.topChunks.length === 0 ? (
                <div className="text-xs text-[var(--muted-foreground)]">No data yet.</div>
              ) : (
                stats.topChunks.map(([s, n], i) => {
                  const label = s.includes(": ") ? s.split(": ").slice(1).join(": ") : s;
                  return (
                    <div key={s} className="flex items-center gap-2 py-1">
                      <div className="text-xs text-[var(--muted-foreground)] w-5">{i + 1}.</div>
                      <div className="text-sm text-[var(--neutral-ink)] flex-1 truncate">{label}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{n}</div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="bg-[var(--card)] rounded-[12px] shadow-card p-4">
              <div className="text-sm font-semibold text-[var(--harmony)] mb-3">
                Most Asked Questions
              </div>
              {stats.topQuestions.length === 0 ? (
                <div className="text-xs text-[var(--muted-foreground)]">No data yet.</div>
              ) : (
                stats.topQuestions.map(([q, n], i) => (
                  <div key={q} className="flex items-center gap-2 py-1">
                    <div className="text-xs text-[var(--muted-foreground)] w-5">{i + 1}.</div>
                    <div className="text-sm text-[var(--neutral-ink)] flex-1 truncate">
                      {q.length > 55 ? `${q.slice(0, 55)}…` : q}
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)]">{n}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── KNOWLEDGE BASE TAB ── */}
      {activeTab === "kb" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[var(--harmony)]">Knowledge Base</h1>
              <p className="text-sm text-[var(--muted-foreground)]">
                Manage entries that the agent uses to answer questions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {missingCount > 0 && (
                <button
                  onClick={runBackfill}
                  disabled={backfilling}
                  className="text-sm px-4 py-2 rounded-[8px] border border-[var(--harmony)] text-[var(--harmony)] bg-transparent hover:bg-[var(--harmony-lite)] inline-flex items-center gap-2 disabled:opacity-60"
                >
                  {backfilling ? (
                    <span className="w-4 h-4 border-2 border-[var(--harmony)]/40 border-t-[var(--harmony)] rounded-full animate-spin" />
                  ) : null}
                  {backfilling ? "Generating…" : `Generate Embeddings (${missingCount})`}
                </button>
              )}
              <button
                onClick={openNew}
                className="bg-[var(--hunger)] hover:bg-[var(--heart)] text-white px-4 py-2 rounded-[8px] text-sm font-medium inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add New Entry
              </button>
              <button
                onClick={onLogout}
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--neutral-ink)] px-3 py-2"
              >
                Sign out
              </button>
            </div>
          </div>

          <div className="bg-[var(--card)] rounded-[12px] shadow-card p-4 mb-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Category</label>
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="px-3 py-1.5 rounded-[8px] border border-[var(--border)] text-sm bg-[var(--card)] text-[var(--foreground)]"
              >
                <option>All</option>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Week</label>
              <select
                value={filterWeek}
                onChange={(e) => setFilterWeek(e.target.value)}
                className="px-3 py-1.5 rounded-[8px] border border-[var(--border)] text-sm bg-[var(--card)] text-[var(--foreground)]"
              >
                <option>All</option>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((w) => (
                  <option key={w}>{w}</option>
                ))}
              </select>
            </div>
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search title, content, category, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 rounded-[8px] border border-[var(--border)] 
                           text-sm bg-[var(--card)] text-[var(--foreground)] 
                           placeholder:text-[var(--muted-foreground)]
                           focus:outline-none focus:border-[var(--hunger)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 
                             text-[var(--muted-foreground)] hover:text-[var(--neutral-ink)]"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="ml-auto text-xs text-[var(--muted-foreground)]">
              {filtered.length} of {entries.length} entries
            </div>
          </div>

          <div className="bg-[var(--card)] rounded-[12px] shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--muted)] text-left text-[var(--muted-foreground)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Week</th>
                  <th className="px-4 py-3 font-medium">Tags</th>
                  <th className="px-4 py-3 font-medium">Featured</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[var(--muted-foreground)]">
                      Loading…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <FileText className="w-8 h-8 mx-auto text-[var(--muted-foreground)] mb-2" />
                      <div className="text-[var(--muted-foreground)]">No entries yet.</div>
                      <button
                        onClick={openNew}
                        className="mt-3 text-sm text-[var(--hunger)] font-medium hover:underline"
                      >
                        Add your first entry
                      </button>
                    </td>
                  </tr>
                ) : (
                  filtered.map((e) => (
                    <tr
                      key={e.id}
                      onClick={() => setPreviewEntry(e)}
                      className="border-t border-[var(--border)] cursor-pointer hover:bg-[var(--muted)] transition-colors"
                    >
                      <td className="px-4 py-3 w-[160px]">
                        <span className={`${categoryPillClass(e.category)} text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap inline-block`}>
                          {e.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-[var(--neutral-ink)] max-w-md truncate">
                        {e.title}
                      </td>
                      <td className="px-4 py-3 text-[var(--muted-foreground)]">{e.week_number ?? "—"}</td>
                      <td className="px-4 py-3 text-[var(--muted-foreground)] text-xs">
                        {e.tags?.join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {e.is_featured ? (
                          <span className="text-[var(--hunger)] font-semibold">★</span>
                        ) : (
                          <span className="text-[var(--muted-foreground)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openEdit(e)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[var(--harmony)] hover:bg-[var(--harmony-lite)]"
                          aria-label="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => remove(e.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[var(--heart)] hover:bg-[var(--hunger-lite)] ml-1"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── FORM MODAL — outside tab conditionals, always available ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={() => setShowForm(false)}>
          <div
            className="w-full max-w-xl h-full bg-[var(--card)] shadow-elevated overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[var(--card)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--harmony)]">
                {form.id ? "Edit entry" : "New entry"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-md hover:bg-[var(--clarity)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-[8px] border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Title">
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-[8px] border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
                />
              </Field>
              <Field label="Content">
                <textarea
                  rows={10}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-[8px] border border-[var(--border)] resize-y leading-relaxed bg-[var(--card)] text-[var(--foreground)]"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Week (1–10, optional)">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={form.week_number}
                    onChange={(e) => setForm({ ...form, week_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-[8px] border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
                  />
                </Field>
                <Field label="Featured">
                  <label className="inline-flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                      className="w-4 h-4 accent-[var(--hunger)]"
                    />
                    <span className="text-sm text-[var(--neutral-ink)]">Surface this entry first</span>
                  </label>
                </Field>
              </div>
              <Field label="Follow-up Question (optional)">
                <input
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  placeholder="e.g. What did she learn about entertainment infrastructure?"
                  className="w-full px-3 py-2 rounded-[8px] border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
                />
                <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">
                  This is what shows as a suggested follow-up chip in the chat interface.
                </p>
              </Field>
              <Field label="Tags (comma-separated)">
                <input
                  value={form.tagsInput}
                  onChange={(e) => setForm({ ...form, tagsInput: e.target.value })}
                  placeholder="e.g. research, account, AI"
                  className="w-full px-3 py-2 rounded-[8px] border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
                />
                {form.tagsInput && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {form.tagsInput
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((t) => (
                        <span
                          key={t}
                          className="bg-[var(--vision)] text-white text-[11px] px-2 py-0.5 rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                  </div>
                )}
              </Field>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-[8px] border border-[var(--harmony)] text-[var(--harmony)] text-sm font-medium hover:bg-[var(--harmony-lite)]"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="px-5 py-2 rounded-[8px] bg-insight-gradient text-white text-sm font-medium disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewEntry && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex justify-start"
          onClick={() => setPreviewEntry(null)}
        >
          <div
            className="w-full max-w-xl h-full bg-[var(--card)] shadow-elevated overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[var(--card)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
              <div>
                <span className={`${categoryPillClass(previewEntry.category)} text-[10px] font-medium px-2 py-0.5 rounded-full inline-block mb-2`}>
                  {previewEntry.category}
                </span>
                <h2 className="text-lg font-semibold text-[var(--harmony)]">
                  {previewEntry.title}
                </h2>
              </div>
              <button
                onClick={() => setPreviewEntry(null)}
                className="p-1.5 rounded-md hover:bg-[var(--clarity)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex gap-4 text-sm text-[var(--muted-foreground)]">
                <span>Week: {previewEntry.week_number ?? "—"}</span>
                <span>Featured: {previewEntry.is_featured ? "★ Yes" : "No"}</span>
              </div>
              {previewEntry.tags?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {previewEntry.tags.map((t) => (
                    <span key={t} className="bg-[var(--vision)] text-white text-[11px] px-2 py-0.5 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
              {(previewEntry as any).question ? (
                <div>
                  <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-1">
                    Follow-up Question
                  </div>
                  <p className="text-sm text-[var(--neutral-ink)] italic">
                    {(previewEntry as any).question}
                  </p>
                </div>
              ) : null}
              <div>
                <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
                  AI Summary
                </div>
                {summaryLoading ? (
                  <div className="space-y-2">
                    {[90, 75, 85, 65].map((w, i) => (
                      <div
                        key={i}
                        className="h-3 rounded bg-[var(--muted)] animate-pulse"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>
                ) : summary.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-[var(--neutral-ink)] leading-relaxed space-y-1">
                    {summary.map((bullet, i) => (
                      <li key={i} className="pl-1">
                        <span className="text-[var(--neutral-ink)]">
                          {bullet.replace(/^[-•*]\s*/, "")}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[var(--neutral-ink)] leading-relaxed whitespace-pre-wrap">
                    No summary available.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
