import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
});

const DeleteInput = z.object({
  password: z.string(),
  id: z.string().uuid(),
});

const ListInput = z.object({});

function checkPassword(p: string) {
  if (p !== ADMIN_PASSWORD) throw new Error("Unauthorized");
}

export const listEntries = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => ListInput.parse(d ?? {}))
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = {
      category: data.category,
      title: data.title,
      content: data.content,
      week_number: data.week_number ?? null,
      tags: data.tags ?? null,
      is_featured: data.is_featured ?? false,
    };
    if (data.id) {
      const { error } = await supabaseAdmin.from("knowledge_base").update(row).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("knowledge_base").insert(row);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteEntry = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => DeleteInput.parse(d))
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("knowledge_base").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
