// Server-only helper: generate a 1536-dim embedding via OpenAI.
// Must only be called from server functions / server code (uses process.env).

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured on the server.");

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI embeddings request failed (${res.status}): ${body.slice(0, 200)}`);
  }

  const payload = (await res.json()) as {
    data?: Array<{ embedding: number[] }>;
  };
  const embedding = payload.data?.[0]?.embedding;
  if (!embedding || !Array.isArray(embedding)) {
    throw new Error("OpenAI embeddings response did not include an embedding array.");
  }
  return embedding;
}
