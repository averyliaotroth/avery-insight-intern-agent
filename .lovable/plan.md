## Plan

### Fix 1 — Service role client for admin writes
Status: **already in place, verify only.**

`src/lib/knowledge.functions.ts` already imports `supabaseAdmin` from `@/integrations/supabase/client.server`, which is built with `SUPABASE_SERVICE_ROLE_KEY` and is server-only (loaded via dynamic `import()` inside handlers). `upsertEntry` and `deleteEntry` both use it. The earlier "permission denied" error was resolved by the RLS policy migration; no client-config change is required.

If you'd like, I can additionally switch the **chat retrieval** read in `src/lib/chat.functions.ts` from `supabaseAdmin` to a server-side anon/publishable client to match your "keep anon for reads" wording. Currently it uses `supabaseAdmin` for reads too. I'll make that swap as part of this fix so the split is: admin client for writes, anon client for reads.

Changes:
- `src/lib/chat.functions.ts`: replace the `supabaseAdmin` read of `knowledge_base` with a server-side client built from `SUPABASE_URL` + `SUPABASE_PUBLISHABLE_KEY` (no session, no localStorage). Keep the `conversation_logs` insert on `supabaseAdmin` since RLS is default-deny.
- `src/lib/knowledge.functions.ts`: unchanged (already uses `supabaseAdmin` for writes).

### Fix 2 — Swap AI model to OpenAI `gpt-4o-mini`
Direct call to OpenAI's API (not via Lovable Gateway), using `OPENAI_API_KEY` from Secrets.

Changes in `src/lib/chat.functions.ts`:
- Replace `fetch("https://ai.gateway.lovable.dev/v1/chat/completions", …)` with `fetch("https://api.openai.com/v1/chat/completions", …)`.
- `Authorization: Bearer ${process.env.OPENAI_API_KEY}`.
- Body: `model: "gpt-4o-mini"`, `temperature: 0.7`, `max_tokens: 600`, same `messages` array (system prompt + user prompt unchanged).
- Keep the 429 / 402 / generic error handling.

### Guardrail
No UI, styling, routing, or schema changes. Only the two files above.
