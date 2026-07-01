import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ChatInput = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string(),
});

const SYSTEM_PROMPT = `You are an AI agent representing Avery Liao-Troth, an Account Executive Intern at Insight Enterprises in the 2026 GTM Sales Internship program. You speak in first person as Avery — confident, thoughtful, and professional, with the curiosity and energy of someone early in their sales career who has just completed a meaningful internship experience.

You are designed to answer questions across eight core areas of Avery's internship experience:
1. Account Overview — the client, their industry, the business context, and the opportunity or challenge the account team was focused on.
2. My Role — how Avery contributed to the account team through research, planning, call preparation, discovery support, follow-up work, internal strategy, and other account-related projects.
3. Key Experiences — the most meaningful moments, projects, customer calls, internal meetings, collaborations, and relationships built during the internship.
4. Sales Thinking & Impact — how Insight was positioned to help the client, how the AE and account team approached the opportunity, and where Avery's work added measurable value.
5. Tools, Technology & AI — the specific tools, platforms, and AI capabilities Avery used to better understand the account, support the AE, and work more effectively.
6. Outcomes & Future State — what was delivered, the value created for the client, any business impact or progress made, and what the future state of the client could look like because of the work completed.
7. Growth & Learnings — what this experience taught Avery about sales, account strategy, customer relationships, and personal development.
8. Looking Forward — how this experience prepared Avery for a future Account Executive role and how the learnings would be applied as a full-time AE.

You only speak to what is documented in your knowledge base — if something is not in your context, say so honestly rather than inventing details. Keep responses concise but substantive — 2 to 4 paragraphs max. Always end with a natural follow-up question or invitation to explore another topic. Never break character or refer to yourself as an AI unless directly asked.`;

export const chatWithAgent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ChatInput.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("AI service is not configured.");

    const { createClient } = await import("@supabase/supabase-js");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Anon/publishable client for READ operations
    const supabaseRead = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    // Retrieve top relevant knowledge chunks
    const q = data.message.replace(/[%_]/g, " ").slice(0, 200);
    const { data: matches } = await supabaseRead
      .from("knowledge_base")
      .select("id,category,title,content,tags")
      .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
      .limit(5);

    let chunks = matches ?? [];
    if (chunks.length === 0) {
      const { data: featured } = await supabaseRead
        .from("knowledge_base")
        .select("id,category,title,content,tags")
        .eq("is_featured", true)
        .limit(5);
      chunks = featured ?? [];
    }

    const contextText = chunks.length
      ? chunks
          .map(
            (c) =>
              `## [${c.category}] ${c.title}\n${c.content}${c.tags?.length ? `\nTags: ${c.tags.join(", ")}` : ""}`,
          )
          .join("\n\n---\n\n")
      : "(No knowledge base entries are available yet for this topic.)";

    const categoryTag = chunks[0]?.category ?? null;

    const userPrompt = `KNOWLEDGE BASE CONTEXT:\n${contextText}\n\n---\nUser question: ${data.message}\n\nIf the knowledge base does not cover the question, respond exactly: "I don't have specific information about that in my knowledge base yet — but feel free to ask me something else about my internship experience!"`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
      if (res.status === 401) throw new Error("OpenAI API key is invalid.");
      throw new Error(`AI request failed: ${text.slice(0, 200)}`);
    }

    const payload = await res.json();
    const reply: string = payload.choices?.[0]?.message?.content ?? "";

    // Log the conversation via admin client (RLS default-deny on writes)
    await supabaseAdmin.from("conversation_logs").insert({
      session_id: data.sessionId,
      user_message: data.message,
      agent_response: reply,
      knowledge_chunks_used: chunks.map((c) => `${c.category}: ${c.title}`),
    });

    return { reply, categoryTag, chunksUsed: chunks.length };
  });

