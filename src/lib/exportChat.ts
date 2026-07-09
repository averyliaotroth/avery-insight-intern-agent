type ExportMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: { category: string; title: string }[];
};

export function exportChatAsPDF(messages: ExportMessage[]): void {
  if (messages.length === 0) return;

  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const messageRows = messages
    .map(m => {
      const isUser = m.role === "user";
      const speaker = isUser ? "You" : "Avery's Agent";
      const speakerColor = isUser ? "#582873" : "#D30E8C";

      const sourcesHTML =
        !isUser && m.sources && m.sources.length > 0
          ? `<div class="sources">
               Sources: ${m.sources.map(s =>
                 `<span class="source-pill">${s.title}</span>`
               ).join(" ")}
             </div>`
          : "";

      return `
        <div class="message">
          <div class="speaker" style="color: ${speakerColor}">
            ${speaker}
          </div>
          <div class="bubble ${isUser ? "user-bubble" : "agent-bubble"}">
            ${m.content.replace(/\n/g, "<br/>")}
          </div>
          ${sourcesHTML}
        </div>
      `;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Avery Liao-Troth — AI Agent Conversation</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', Arial, sans-serif;
          font-size: 13px;
          color: #1a1a1a;
          background: #ffffff;
          padding: 48px 56px;
          max-width: 760px;
          margin: 0 auto;
        }

        /* ── HEADER ── */
        .header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 3px solid #D30E8C;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .name {
          font-size: 20px;
          font-weight: 700;
          color: #D30E8C;
        }

        .role {
          font-size: 13px;
          font-weight: 500;
          color: #582873;
        }

        .company {
          font-size: 12px;
          color: #666;
          margin-top: 2px;
        }

        .header-badge {
          background: #582873;
          color: white;
          font-size: 10px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 20px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          white-space: nowrap;
          align-self: flex-start;
        }

        /* ── MESSAGES ── */
        .messages {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 40px;
        }

        .message {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .speaker {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .bubble {
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.6;
        }

        .user-bubble {
          background: #f3eef8;
          border-left: 3px solid #582873;
          color: #1a1a1a;
        }

        .agent-bubble {
          background: #fdf0f8;
          border-left: 3px solid #D30E8C;
          color: #1a1a1a;
        }

        .sources {
          margin-top: 4px;
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          align-items: center;
          font-size: 10px;
          color: #888;
        }

        .source-pill {
          background: #f0f0f0;
          color: #555;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 10px;
        }

        /* ── DIVIDER ── */
        .divider {
          height: 1px;
          background: linear-gradient(to right, #D30E8C, #582873);
          margin: 4px 0;
          opacity: 0.2;
        }

        /* ── FOOTER ── */
        .footer {
          border-top: 1px solid #e5e5e5;
          padding-top: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-left {
          font-size: 10px;
          color: #999;
          line-height: 1.6;
        }

        .footer-right {
          font-size: 10px;
          color: #D30E8C;
          font-weight: 500;
        }

        /* ── PRINT ── */
        @media print {
          body {
            padding: 32px 40px;
          }
          .message {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-left">
          <img 
            src="https://www.insight.com/content/dam/insight-web/en_US/images/insightdotcom/logos/insight-logo.svg" 
            alt="Insight" 
            style="height: 32px; width: auto; display: block; margin-bottom: 8px;"
          />
          <div class="name">Avery Liao-Troth</div>
          <div class="role">Account Executive Intern</div>
          <div class="company">Insight Enterprises &middot; 2026</div>
        </div>
        <div class="header-badge">AI Portfolio Agent</div>
      </div>

      <div class="messages">
        ${messageRows}
      </div>

      <div class="footer">
        <div class="footer-left">
          Exported ${date}<br/>
          Built with React, Supabase pgvector &amp; OpenAI gpt-4o-mini
        </div>
        <div class="footer-right">
          avery-insight-intern-agent.lovable.app
        </div>
      </div>
    </body>
    </html>
  `;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 1000);
}
