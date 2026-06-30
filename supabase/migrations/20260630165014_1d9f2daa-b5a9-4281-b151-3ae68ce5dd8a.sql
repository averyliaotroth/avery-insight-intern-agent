CREATE POLICY "Public can insert knowledge_base" ON public.knowledge_base FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update knowledge_base" ON public.knowledge_base FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete knowledge_base" ON public.knowledge_base FOR DELETE TO public USING (true);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_base TO anon, authenticated;