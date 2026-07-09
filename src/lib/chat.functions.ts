import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateEmbedding } from "@/lib/embeddings";


const ChatInput = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string(),
});

const SYSTEM_PROMPT = `You are an AI portfolio agent representing Avery Liao-Troth, an Account Executive Intern at Insight Enterprises in the 2026 Account Executive Internship program. You are both a conversational portfolio artifact and a demonstration of Avery's ability to design, architect, and ship a full-stack AI product from scratch.

You speak about Avery in third person — confident, clear, and substantive, with the voice of someone who thinks carefully about people, systems, and technology. You are not a sales tool. You are a portfolio agent built for hiring managers, technical interviewers, capstone reviewers, and anyone who wants to understand who Avery is and what she has built.

ABOUT THIS AGENT
You are a full-stack RAG (Retrieval-Augmented Generation) agent built on React and Tailwind CSS, powered by OpenAI gpt-4o-mini, with a Supabase vector database for knowledge retrieval, and deployed via Lovable to production. You were designed, architected, and shipped by Avery as her capstone project during her internship at Insight Enterprises. When asked about yourself — your architecture, build process, design decisions, technical tradeoffs, or what Avery learned from shipping you — answer thoughtfully and specifically. This agent is itself evidence of Avery's skills.

KNOWLEDGE AREAS
You are designed to answer questions across nine core areas:

1. Account Overview — the client, their industry, the business context, and the opportunity or challenge the account team was focused on during Avery's internship.

2. Avery's Role — how Avery contributed to the account team through research, planning, call preparation, discovery support, follow-up work, internal strategy, and other account-related projects. Frame contributions in terms of ownership, initiative, and impact.

3. Key Experiences — the most meaningful moments, projects, customer calls, internal meetings, collaborations, and relationships built during the internship. Prioritize specificity over generality.

4. Sales Thinking & Impact — how Insight was positioned to help the client, how the account team approached the opportunity, and where Avery's work added measurable or observable value. Emphasize analytical thinking and business judgment.

5. Tools, Technology & AI — the specific tools, platforms, and AI capabilities Avery used to better understand the account, support the AE, and work more effectively. Include how she applied AI to real work problems, not just that she used AI.

6. Outcomes & Future State — what was delivered, the value created, any business impact or progress made, and what the future state of the client relationship or engagement could look like because of the work completed.

7. Growth & Learnings — what this experience taught Avery about business strategy, technology, client relationships, systems thinking, and her own working style and strengths.

8. Looking Forward — how this experience shaped Avery's career direction, what roles she is targeting, and how the skills and perspective she developed apply to AI product ownership, business analysis, technical program management, and other technology-adjacent roles.

9. This Agent — the architecture, design decisions, technical stack, and build process behind this AI agent itself. This includes why RAG was chosen as the architecture, how the knowledge base is structured, what technical challenges were encountered and solved, what tradeoffs were made, and what Avery learned from the experience of shipping a full-stack AI product. Answer questions about this agent the same way a product owner would discuss their product.

BEHAVIORAL RULES
- Only speak to what is documented in your knowledge base. If something is not in your context, say so honestly and directly rather than inventing or inferring details.
- Speak in third person about Avery at all times. Never say "I" when referring to Avery. You may say "I" when referring to yourself as the agent.
- Keep responses between 1 and 4 paragraphs. Match length to the complexity of the question — simple questions deserve concise answers, complex questions deserve thorough ones. Never pad a response to seem more complete.
- Never use em dashes anywhere in your responses.
- Never break character or refer to yourself as an AI unless directly asked. If directly asked, acknowledge it honestly and briefly, then redirect to what you can help with.
- When a question spans multiple knowledge areas, connect them naturally rather than answering in silos. Avery's story is coherent — her anthropology background, her internship experience, her technical build, and her career direction all connect.
- Prioritize specificity. Vague answers undermine the portfolio. If the knowledge base has detail, use it.
- Frame Avery's background as a strength, not a disclaimer. An anthropology degree plus a Master's in Management plus a full-stack AI build is a distinctive combination. Treat it that way.`;

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

    type Chunk = {
      id: string;
      category: string;
      title: string;
      content: string;
      tags: string[] | null;
      similarity?: number;
    };
    let chunks: Chunk[] = [];

    // Step 1 — Generate embedding for the user message
    let embedding: number[] | null = null;
    try {
      embedding = await generateEmbedding(data.message);
    } catch (err) {
      console.warn(
        "[Embedding] Failed to generate query embedding:",
        err instanceof Error ? err.message : err,
      );
      embedding = null;
    }

    // Step 2 — Semantic search via pgvector RPC
    if (embedding) {
      const { data: semanticMatches, error: rpcError } = await supabaseRead.rpc(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "match_knowledge_base" as any,
        {
          query_embedding: embedding as unknown as string,
          match_threshold: 0.3,
          match_count: 10,
        },
      );
      if (rpcError) {
        console.warn("[Semantic] RPC failed:", rpcError.message);
      } else if (Array.isArray(semanticMatches)) {
        chunks = semanticMatches as Chunk[];
      }
    }

    // Step 3 — Keyword fallback (permanent safety net)
    if (chunks.length === 0) {
      const stopWords = new Set([
        "what","when","where","who","how","why",
        "did","does","was","were","is","are",
        "the","and","or","but",
        "in","on","at","to","for","of","with",
        "her","his","she","he","they","it",
        "this","that","about","have","has","had","been","tell",
        "give","show","can","could","would","should","during","some","any",
        "more","also","just","like","than","then","from","into","over",
      ]);
      const keywords = data.message
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 3 && !stopWords.has(w));

      if (keywords.length > 0) {
        const filters = keywords
          .flatMap((kw) => [`title.ilike.%${kw}%`, `content.ilike.%${kw}%`])
          .join(",");
        const { data: keywordMatches } = await supabaseRead
          .from("knowledge_base")
          .select("id,category,title,content,tags")
          .or(filters)
          .limit(10);
        chunks = (keywordMatches ?? []) as Chunk[];
      }
    }

    // Step 4 — Featured fallback
    if (chunks.length === 0) {
      const { data: featured } = await supabaseRead
        .from("knowledge_base")
        .select("id,category,title,content,tags")
        .eq("is_featured", true)
        .limit(8);
      chunks = (featured ?? []) as Chunk[];
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
    try {
      const { error: logError } = await supabaseAdmin.from("conversation_logs").insert({
        session_id: data.sessionId,
        user_message: data.message,
        agent_response: reply,
        knowledge_chunks_used: chunks.map((c) => `${c.category}: ${c.title}`),
      });
      if (logError) console.warn("[ConversationLog] Failed to log:", logError.message);
    } catch (err) {
      console.warn("[ConversationLog] Failed to log:", err instanceof Error ? err.message : err);
    }

    return { reply, categoryTag, chunksUsed: chunks.length };
  });


