type ExportMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: { category: string; title: string }[];
};

export function exportChatAsText(messages: ExportMessage[]): void {
  if (messages.length === 0) return;

  const header = [
    "Avery Liao-Troth — AI Portfolio Agent",
    "Insight Enterprises | Account Executive Intern | 2026",
    "avery-insight-intern-agent.lovable.app",
    "─".repeat(50),
    "",
  ].join("\n");

  const body = messages
    .map(m => {
      const speaker = m.role === "user" ? "You" : "Avery's Agent";
      let block = `${speaker}:\n${m.content}`;

      if (
        m.role === "assistant" &&
        m.sources &&
        m.sources.length > 0
      ) {
        const sourceList = m.sources
          .map(s => `  • ${s.title} [${s.category}]`)
          .join("\n");
        block += `\n\nSources used:\n${sourceList}`;
      }

      return block;
    })
    .join("\n\n" + "─".repeat(50) + "\n\n");

  const footer = [
    "",
    "─".repeat(50),
    `Exported on ${new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    "Built with React, Supabase pgvector, and OpenAI gpt-4o-mini",
  ].join("\n");

  const full = header + body + footer;

  const blob = new Blob([full], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `avery-agent-conversation-${new Date()
    .toISOString()
    .slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
