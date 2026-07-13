import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SummarizeInput = z.object({
  content: z.string().min(1),
});

export const summarizeEntry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => SummarizeInput.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return { bullets: [] };

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
              content:
                "You are a concise summarizer. Given a knowledge base entry, return exactly 4 to 6 bullet points that capture the key information. Each bullet must be one sentence maximum. Be specific, not generic. Return only the bullet points as a JSON array of strings with no other text, no markdown, no code blocks.",
            },
            {
              role: "user",
              content: `Summarize this knowledge base entry into 4-6 bullet points:\n\n${data.content}`,
            },
          ],
          max_tokens: 300,
          temperature: 0.3,
        }),
      });

      if (!res.ok) return { bullets: [] };

      const payload = await res.json();
      const raw: string = payload.choices?.[0]?.message?.content ?? "";

      // Parse JSON array response
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return {
            bullets: parsed
              .map((b: unknown) => String(b).replace(/^[-•*]\s*/, "").trim())
              .filter(Boolean)
              .slice(0, 6),
          };
        }
      } catch {
        // Fallback — split by newline and clean up
        const lines = raw
          .split("\n")
          .map((l) => l.replace(/^[-•*\d.]\s*/, "").trim())
          .filter((l) => l.length > 10)
          .slice(0, 6);
        return { bullets: lines };
      }

      return { bullets: [] };
    } catch {
      return { bullets: [] };
    }
  });
