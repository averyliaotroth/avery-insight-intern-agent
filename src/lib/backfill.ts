import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { generateEmbedding } from "@/lib/embeddings";

function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceKey =
    process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SERVICE_ROLE_KEY on the server.");
  }
  return createClient<Database>(url, serviceKey, {
    global: {
      fetch: (input, init) => {
        const headers = new Headers(
          typeof Request !== "undefined" && input instanceof Request
            ? input.headers
            : undefined,
        );
        if (init?.headers) {
          new Headers(init.headers).forEach((v, k) => headers.set(k, v));
        }
        if (
          (serviceKey.startsWith("sb_secret_") ||
            serviceKey.startsWith("sb_publishable_")) &&
          headers.get("Authorization") === `Bearer ${serviceKey}`
        ) {
          headers.delete("Authorization");
        }
        headers.set("apikey", serviceKey);
        return fetch(input, { ...init, headers });
      },
    },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

function getReadClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export type BackfillResult = {
  processed: number;
  failed: number;
  errors: string[];
};

export const backfillEmbeddings = createServerFn({ method: "POST" }).handler(
  async (): Promise<BackfillResult> => {
    const supabaseRead = getReadClient();
    const supabaseAdmin = getAdminClient();

    const { data: rows, error } = await supabaseRead
      .from("knowledge_base")
      .select("id,category,title,content")
      .is("embedding", null);

    if (error) throw new Error(error.message);

    const result: BackfillResult = { processed: 0, failed: 0, errors: [] };
    if (!rows || rows.length === 0) return result;

    for (const row of rows) {
      try {
        const combined = `${row.category} ${row.title} ${row.content}`;
        const embedding = await generateEmbedding(combined);
        const { error: updateErr } = await supabaseAdmin
          .from("knowledge_base")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .update({ embedding: embedding as any })
          .eq("id", row.id);
        if (updateErr) throw new Error(updateErr.message);
        result.processed += 1;
      } catch (err) {
        result.failed += 1;
        const msg = err instanceof Error ? err.message : String(err);
        result.errors.push(`${row.id}: ${msg}`);
      }
      await new Promise((r) => setTimeout(r, 200));
    }

    return result;
  },
);

export const countMissingEmbeddings = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ count: number }> => {
    const supabaseRead = getReadClient();
    const { count, error } = await supabaseRead
      .from("knowledge_base")
      .select("id", { count: "exact", head: true })
      .is("embedding", null);
    if (error) throw new Error(error.message);
    return { count: count ?? 0 };
  },
);
