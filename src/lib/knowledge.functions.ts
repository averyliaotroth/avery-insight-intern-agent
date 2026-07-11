import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { generateEmbedding } from "@/lib/embeddings";


const ADMIN_PASSWORD = "insight2026";

const EntryInput = z.object({
  password: z.string(),
  id: z.string().uuid().optional(),
  category: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  week_number: z.number().int().min(1).max(10).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  is_featured: z.boolean().optional(),
  question: z.string().nullable().optional(),
});

const DeleteInput = z.object({
  password: z.string(),
  id: z.string().uuid(),
});

const ListInput = z.object({});

function checkPassword(p: string) {
  if (p !== ADMIN_PASSWORD) throw new Error("Unauthorized");
}

// Server-side admin client — uses SUPABASE_URL + SERVICE_ROLE_KEY, bypasses RLS.
// Kept inside handlers so this module stays safe to import from route files.
function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or key on the server.");
  }

  return createClient<Database>(url, serviceKey, {
    global: {
      // New-format sb_secret_* keys are opaque, not JWTs. Send them as apikey
      // and drop the Bearer header so PostgREST authenticates correctly.
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
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const listEntries = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => ListInput.parse(d ?? {}))
  .handler(async () => {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
      .from("knowledge_base")
      .select("*")
      .order("week_number", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertEntry = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EntryInput.parse(d))
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const supabaseAdmin = getAdminClient();
    const row = {
      category: data.category,
      title: data.title,
      content: data.content,
      week_number: data.week_number ?? null,
      tags: data.tags ?? null,
      is_featured: data.is_featured ?? false,
      question: data.question ?? null,
    };
    let entryId = data.id;
    if (data.id) {
      const { error } = await supabaseAdmin.from("knowledge_base").update(row).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { data: inserted, error } = await supabaseAdmin
        .from("knowledge_base")
        .insert(row)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      entryId = inserted?.id;
    }

    // Generate + persist embedding. Never fails the save.
    if (entryId) {
      try {
        const combined = `${data.category} ${data.title} ${data.content}`;
        const embedding = await generateEmbedding(combined);
        const { error: embErr } = await supabaseAdmin
          .from("knowledge_base")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .update({ embedding: embedding as any })
          .eq("id", entryId);
        if (embErr) console.warn("[Embedding] Failed to persist:", embErr.message);
      } catch (err) {
        console.warn(
          "[Embedding] Failed to generate for entry:",
          err instanceof Error ? err.message : err,
        );
      }
    }

    return { ok: true };
  });


export const deleteEntry = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => DeleteInput.parse(d))
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin.from("knowledge_base").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
