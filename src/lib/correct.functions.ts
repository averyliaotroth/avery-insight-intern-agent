import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CorrectInput = z.object({
  entryId: z.string().uuid(),
  originalContent: z.string(),
  correctionNote: z.string(),
});

export const correctKBEntry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => CorrectInput.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return { correctedContent: null, error: "AI not configured" };

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a precise knowledge base editor. You will be given an existing KB entry and a correction note describing what is wrong and what the correct information is. Your job is to rewrite the entry content incorporating only the corrections described. Do not change anything that is not mentioned in the correction note. Preserve the original tone, structure, length, and style. Write in third person about Avery Liao-Troth using she/her pronouns. No em dashes. Return only the corrected content with no explanation, no preamble, no markdown.`,
            },
            {
              role: "user",
              content: `ORIGINAL ENTRY CONTENT:\n${data.originalContent}\n\nCORRECTION NOTE:\n${data.correctionNote}\n\nRewrite the entry incorporating only the corrections described above.`,
            },
          ],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      });

      if (!res.ok) return { correctedContent: null, error: "AI request failed" };

      const payload = await res.json();
      const correctedContent = payload.choices?.[0]?.message?.content ?? null;
      return { correctedContent, error: null };
    } catch {
      return { correctedContent: null, error: "Request failed" };
    }
  });
