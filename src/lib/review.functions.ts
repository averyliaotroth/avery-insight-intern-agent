import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const FlagInput = z.object({
  id: z.string().uuid(),
  feedback: z.enum(["correct", "needs_fix", "verified"]),
  correction_note: z.string().optional(),
});

const UpdateNoteInput = z.object({
  id: z.string().uuid(),
  correction_note: z.string(),
});

const ResolveInput = z.object({
  id: z.string().uuid(),
});

export const flagConversation = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => FlagInput.parse(data))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    const { error } = await supabase
      .from("conversation_logs")
      .update({
        feedback: data.feedback,
        correction_note: data.correction_note ?? null,
        flagged_at: data.feedback === "needs_fix"
          ? new Date().toISOString()
          : null,
      })
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const updateCorrectionNote = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => UpdateNoteInput.parse(data))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    const { error } = await supabase
      .from("conversation_logs")
      .update({ correction_note: data.correction_note })
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const resolveFlag = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ResolveInput.parse(data))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    const { error } = await supabase
      .from("conversation_logs")
      .update({
        feedback: null,
        correction_note: null,
        flagged_at: null,
      })
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });
