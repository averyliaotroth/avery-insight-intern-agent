const INSIGHT_LOGO_BASE64 = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOC4xLjEsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHZpZXdCb3g9IjAgMCA0NjYuOSAxMjAuMSIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgNDY2LjkgMTIwLjEiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGc+DQoJPGcgaWQ9IlN5bWJvbCI+DQoJCTxwYXRoIGZpbGw9IiNCMDFDODciIGQ9Ik02MC42LDg5LjdWNDIuOWgxMS44djQ2LjdINjAuNnogTTczLjYsMTFjMC00LTMuMS03LjItNy4xLTcuMmMtNCwwLTcuMiwzLjItNy4yLDcuMmMwLDQsMy4yLDcuMSw3LjIsNy4xDQoJCQlDNzAuNSwxOC4xLDczLjYsMTUsNzMuNiwxMXoiLz4NCgkJPHBhdGggZmlsbD0iI0QzMEM1NSIgZD0iTTM1LjQsNi4zVjUzSDIzLjZWNi4zSDM1LjR6IE0yMi4zLDg0LjljMCw0LDMuMSw3LjIsNy4xLDcuMmM0LDAsNy4yLTMuMiw3LjItNy4yYzAtNC0zLjItNy4xLTcuMi03LjENCgkJCUMyNS40LDc3LjksMjIuMyw4MSwyMi4zLDg0Ljl6Ii8+DQoJCTxwYXRoIGZpbGw9IiNENDBFOEMiIGQ9Ik04OS43LDM1LjRINDIuOVYyMy42aDQ2LjdWMzUuNHogTTExLDIyLjNjLTQsMC03LjIsMy4xLTcuMiw3LjFjMCw0LDMuMiw3LjIsNy4yLDcuMmM0LDAsNy4xLTMuMiw3LjEtNy4yDQoJCQlDMTguMSwyNS40LDE1LDIyLjMsMTEsMjIuM3oiLz4NCgkJPHBhdGggZmlsbD0iI0VEMTk0NCIgZD0iTTYuMyw2MC42SDUzdjExLjhINi4zVjYwLjZ6IE04NC45LDczLjZjNCwwLDcuMi0zLjEsNy4yLTcuMWMwLTQtMy4yLTcuMi03LjItNy4yYy00LDAtNy4xLDMuMi03LjEsNy4yDQoJCQlDNzcuOSw3MC41LDgxLDczLjYsODQuOSw3My42eiIvPg0KCTwvZz4NCgk8ZyBpZD0iV29yZG1hcmsiPg0KCQk8cGF0aCBpZD0iSW5zaWdodF8xXyIgZmlsbD0iIzU1NDc0MSIgZD0iTTEyMC4yLDg5LjdWNi4zaDEzLjd2ODMuNEgxMjAuMnogTTI3My43LDEzLjJjMC00LjMtMy40LTcuOC03LjctNy44DQoJCQljLTQuMywwLTcuOCwzLjUtNy44LDcuOGMwLDQuMywzLjUsNy43LDcuOCw3LjdDMjcwLjMsMjAuOSwyNzMuNywxNy41LDI3My43LDEzLjJ6IE0yNzIuNiw4OS43VjMwLjhoLTEzLjN2NTguOEgyNzIuNnoNCgkJCSBNMTk3LjMsNTQuMkwxOTcuMyw1NC4yYzAtMTYuMi0xMC4zLTI1LTI3LjQtMjVjLTExLjksMC0yMS4zLDUuNC0yMi41LDUuOXY1NC42aDEzLjN2LTQ3YzEuNC0wLjYsNS40LTIuMiw5LjktMi4yDQoJCQljOSwwLDEzLjUsNSwxMy41LDEzLjZ2MzUuNmgxMy4zVjU0LjJ6IE0zOTkuOSw1NC4yYzAtMTUuNC0xMC44LTI1LjEtMjQuNi0yNS4xYy04LDAtMTEuNywyLjQtMTIsMi41VjMuMmgtMTMuM3Y4Ni40aDEzLjN2LTQ3DQoJCQljMC40LTAuMiw0LjQtMi4yLDkuNS0yLjJjOC45LDAsMTMuOSw0LjgsMTMuOSwxMy42djM1LjZINDAwTDM5OS45LDU0LjJMMzk5LjksNTQuMnogTTI0OS4zLDczYzAtOS45LTcuMS0xNC4yLTE0LjItMTcuMw0KCQkJYy0xLjItMC41LTUuMS0yLjEtNS43LTIuNGMtNS0yLjEtOC41LTMuNi04LjUtNy42YzAtMywyLjQtNS44LDkuNC01LjhjNi44LDAsMTIuNywzLjUsMTMuMywzLjhsNC45LTkuMmMtMC40LTAuMi02LjktNS4zLTE5LTUuMw0KCQkJYy0xMi45LDAtMjEuOCw3LTIxLjgsMTcuNmMwLDkuNSw2LjcsMTMuNywxMy4xLDE2LjNjMC44LDAuMyw2LjQsMi43LDcuNywzLjJjNSwyLDcuNSw0LjEsNy41LDcuNGMwLDMuNi0zLjMsNi45LTEwLjUsNi45DQoJCQljLTcuNSwwLTEzLjktNC4yLTE0LjktNC44bC01LDkuMmMwLjcsMC42LDguOSw2LjMsMjEuNSw2LjNDMjM5LjksOTEuMiwyNDkuMyw4NC41LDI0OS4zLDczeiBNMzM3LjEsMzUuMXY1MC4zDQoJCQljMCwxOC4xLTguMiwzMC45LTI5LjQsMzAuOWMtOC4zLDAtMTQuMy0xLjYtMTUuNC0xLjh2LTEwLjljMS40LDAuNCw3LjUsMiwxMy43LDJjMTMuMiwwLDE3LjgtNi42LDE3LjgtMTUuNnYtMS4xDQoJCQljLTAuOSwwLjQtNSwyLjMtMTEuNCwyLjNjLTE5LDAtMjkuNC0xNC4yLTI5LjQtMzFjMC0xNy43LDExLTMxLjEsMzAuOS0zMS4xQzMyNS43LDI5LjIsMzM1LjYsMzQuMywzMzcuMSwzNS4xeiBNMzIzLjksNDIuNw0KCQkJYy0wLjgtMC40LTQuOC0yLjItMTAuMi0yLjJjLTkuOSwwLTE3LjIsNy4zLTE3LjIsMTkuOGMwLDEzLjMsOC40LDE5LjYsMTcuMiwxOS42YzUuMiwwLDkuOC0xLjgsMTAuMi0yLjJWNDIuN3ogTTQyNS4xLDQxLjdoMTUNCgkJCVYzMC44SDQyNVYxMy4yaC0xMy4xdjUzYzAsMTYuMSw3LjIsMjMuNSwyMywyMy41YzAuNSwwLDUuMywwLDUuMywwVjc4LjZjLTEwLjcsMC0xNS0zLjEtMTUtMTQuMUw0MjUuMSw0MS43eiIvPg0KCQk8cGF0aCBpZD0iUl8yXyIgZmlsbD0iIzU1NDc0MSIgZD0iTTQ1Ny41LDgxLjVjLTMuMSwwLTUuNiwyLjUtNS42LDUuNXYwYzAsMywyLjQsNS41LDUuNSw1LjVjMy4xLDAsNS42LTIuNSw1LjYtNS41djANCgkJCUM0NjMuMSw4NCw0NjAuNiw4MS41LDQ1Ny41LDgxLjV6IE00NjIuMiw4N2MwLDIuNi0yLDQuNy00LjcsNC43Yy0yLjYsMC00LjYtMi4xLTQuNi00Ljd2MGMwLTIuNiwyLTQuNyw0LjctNC43DQoJCQlDNDYwLjIsODIuMyw0NjIuMiw4NC40LDQ2Mi4yLDg3TDQ2Mi4yLDg3eiBNNDU4LjgsODcuNmMwLjctMC4zLDEuMi0wLjgsMS4yLTEuN3YwYzAtMC41LTAuMi0wLjktMC41LTEuMmMtMC40LTAuNC0xLTAuNi0xLjctMC42DQoJCQloLTIuNXY1LjZoMS4ydi0xLjhoMC45aDBsMS4yLDEuOGgxLjRMNDU4LjgsODcuNnogTTQ1OC44LDg2YzAsMC41LTAuMywwLjgtMSwwLjhoLTEuMnYtMS43aDEuMkM0NTguNCw4NS4xLDQ1OC44LDg1LjQsNDU4LjgsODYNCgkJCUw0NTguOCw4NnoiLz4NCgk8L2c+DQo8L2c+DQo8L3N2Zz4NCg==";

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
            src="${INSIGHT_LOGO_BASE64}" 
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
  }, 500);
}
