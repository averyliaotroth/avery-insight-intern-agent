import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Pencil, Trash2, Plus, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { listEntries, upsertEntry, deleteEntry } from "@/lib/knowledge.functions";
import { backfillEmbeddings, countMissingEmbeddings } from "@/lib/backfill";


export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · Avery Liao-Troth" }] }),
  component: AdminPage,
});

const CATEGORIES = [
  "Account Overview",
  "My Role",
  "Key Experiences",
  "Strategic Thinking & Business Impact",
  "Tools, Technology, & AI",
  "Outcomes & Future State",
  "Growth & Learnings",
  "Looking Forward",
  "Research",
  "This Agent",
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  "Account Overview": "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  "My Role": "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  "Key Experiences": "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  "Strategic Thinking & Business Impact": "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  "Tools, Technology, & AI": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
  "Outcomes & Future State": "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  "Growth & Learnings": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  "Looking Forward": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  "Research": "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
  "This Agent": "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
};

function categoryPillClass(category: string): string {
  return CATEGORY_COLORS[category] ?? "bg-[var(--harmony-lite)] text-[var(--harmony)]";
}

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
};

function emptyForm(): FormState {
  return {
    category: CATEGORIES[0],
    title: "",
    content: "",
    week_number: "",
    tagsInput: "",
    is_featured: false,
  };
}

function KnowledgeManager({ onLogout }: { onLogout: () => void }) {
  const list = useServerFn(listEntries);
  const upsert = useServerFn(upsertEntry);
  const del = useServerFn(deleteEntry);
  const backfill = useServerFn(backfillEmbeddings);
  const countMissing = useServerFn(countMissingEmbeddings);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState<string>("All");
  const [filterWeek, setFilterWeek] = useState<string>("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [missingCount, setMissingCount] = useState(0);
  const [backfilling, setBackfilling] = useState(false);

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

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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


  const filtered = useMemo(
    () =>
      entries.filter(
        (e) =>
          (filterCat === "All" || e.category === filterCat) &&
          (filterWeek === "All" || String(e.week_number ?? "") === filterWeek),
      ),
    [entries, filterCat, filterWeek],
  );

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
                <tr key={e.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 w-[220px]">
                    <span className={`${categoryPillClass(e.category)} text-[12px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap inline-block`}>
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
