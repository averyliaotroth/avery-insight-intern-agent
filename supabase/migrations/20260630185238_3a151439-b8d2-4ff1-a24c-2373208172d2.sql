
-- Lock down knowledge_base: all access goes through server functions using service_role
DROP POLICY IF EXISTS "Public can read knowledge_base" ON public.knowledge_base;
DROP POLICY IF EXISTS "Public can insert knowledge_base" ON public.knowledge_base;
DROP POLICY IF EXISTS "Public can update knowledge_base" ON public.knowledge_base;
DROP POLICY IF EXISTS "Public can delete knowledge_base" ON public.knowledge_base;

-- Lock down conversation_logs: writes go through server function using service_role
DROP POLICY IF EXISTS "Public can insert conversation_logs" ON public.conversation_logs;

-- Revoke any anon/authenticated direct access; service_role retains access and bypasses RLS
REVOKE ALL ON public.knowledge_base FROM anon, authenticated;
REVOKE ALL ON public.conversation_logs FROM anon, authenticated;
GRANT ALL ON public.knowledge_base TO service_role;
GRANT ALL ON public.conversation_logs TO service_role;
