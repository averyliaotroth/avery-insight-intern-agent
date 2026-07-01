# 🤖 Avery Liao-Troth — AE Internship AI Agent

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Agent-D40E8C?style=for-the-badge&logo=vercel&logoColor=white)](https://avery-insight-intern-agent.lovable.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Insight--Internship--2026-582873?style=for-the-badge&logo=github&logoColor=white)](https://github.com/averyliaotroth/Insight-Internship-2026)
[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-582873?style=for-the-badge)](https://lovable.dev)
[![Powered by OpenAI](https://img.shields.io/badge/Powered%20by-OpenAI%20gpt--4o--mini-5990F0?style=for-the-badge&logo=openai&logoColor=white)](https://platform.openai.com)
[![Database](https://img.shields.io/badge/Database-Supabase-4EC7EA?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Internship](https://img.shields.io/badge/Insight%20Enterprises-AE%20Intern%20%2726-AE0A46?style=for-the-badge)](https://insight.com)

> An interactive AI agent trained on my real work, research, and reflections from the **2026 GTM Sales Account Executive Internship** at Insight Enterprises. Ask it anything about my internship experience — live, conversational, and always available.

---

## 🎯 What Is This?

Instead of a static slide deck or written report, I built a **living, interactive portfolio artifact** for my capstone project. Anyone with the link can have a real conversation with an AI agent that speaks as me — answering questions about the account I supported, the work I did alongside the AE team, the tools I used, and what I learned.

This project directly satisfies the **Tools, Technology & AI** requirement of the 2026 GTM Sales Capstone — the agent itself is the demonstration.

**Why build this instead of a slide deck?**
- A Horizon Custom Insights agent would have been faster — but the link dies when the internship ends
- This lives at a public URL forever, shareable on a resume, LinkedIn, or in an interview
- *"I integrated the OpenAI API into a full-stack React + Supabase app"* is a stronger signal than *"I used an internal tool"*

---

## 🚀 Live Demo

👉 **[Talk to the agent → avery-insight-intern-agent.lovable.app](https://avery-insight-intern-agent.lovable.app)**

Try asking:
- *"What account did you support this summer?"*
- *"What was your role on the account team?"*
- *"What tools and AI did you use?"*
- *"What was your biggest learning?"*
- *"What outcomes did you deliver?"*

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React + Tailwind CSS | Chat UI, About page, Admin panel |
| **Build Platform** | Lovable | Full-stack app generation & hosting |
| **Database** | Supabase (PostgreSQL) | Knowledge base & conversation logs |
| **AI Model** | OpenAI gpt-4o-mini | Conversational agent brain |
| **Design System** | Insight Enterprises Brand | Official color palette & typography |

---

## 🧠 How It Works

```
User Question
      │
      ▼
┌─────────────────────────┐
│     Chat Interface      │  React + Tailwind (Lovable Cloud)
│  avery-insight-intern-  │
│  agent.lovable.app      │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│   Retrieval Function    │  ilike search on title, content & tags
│   → Supabase Query      │  Returns top 3–5 relevant rows
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│   OpenAI API Call       │  gpt-4o-mini | temp: 0.7 | max tokens: 600
│   + Context Injection   │  Retrieved knowledge chunks added as context
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│   Agent Response        │  First-person, 2–4 paragraphs + follow-up
│   + Conversation Log    │  Exchange logged to Supabase
└─────────────────────────┘
```

---

## 📚 Knowledge Base Structure

The agent's knowledge is organized across **9 categories** mapping directly to the 2026 GTM Sales Capstone requirements:

| # | Category | What the Agent Knows |
|---|---|---|
| 1 | **Account Overview** | The client, their industry, the business context, and the opportunity |
| 2 | **My Role** | How I contributed through research, planning, call prep, and strategy |
| 3 | **Key Experiences** | The most meaningful projects, calls, and relationships |
| 4 | **Sales Thinking & Impact** | How Insight was positioned and where my work moved the needle |
| 5 | **Tools & AI** | The specific tools and AI platforms I used to work smarter |
| 6 | **Outcomes & Future State** | What was delivered and the value created for the client |
| 7 | **Growth & Learnings** | What I learned about sales, strategy, and personal development |
| 8 | **Looking Forward** | How this experience prepares me for a full-time AE role |
| 9 | **Research** | Industry research and analysis conducted during the internship |

---

## 🗄️ Database Schema

### `knowledge_base`
```sql
CREATE TABLE knowledge_base (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category     TEXT NOT NULL,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  week_number  INTEGER,
  tags         TEXT[],
  is_featured  BOOLEAN DEFAULT false,
  created_at   TIMESTAMP DEFAULT now(),
  updated_at   TIMESTAMP DEFAULT now()
);
```

### `conversation_logs`
```sql
CREATE TABLE conversation_logs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            TEXT,
  user_message          TEXT,
  agent_response        TEXT,
  knowledge_chunks_used TEXT[],
  created_at            TIMESTAMP DEFAULT now()
);
```

**Row Level Security:**
- `knowledge_base`: Public `SELECT` | `INSERT/UPDATE/DELETE` restricted
- `conversation_logs`: Public `INSERT` | `SELECT` restricted to admin

---

## 🎨 Design System

Built on Insight Enterprises' official brand palette:

| Color | Hex | Pantone | Usage |
|---|---|---|---|
| Hunger (Magenta) | `#D40E8C` | 233 C | CTAs, active states, user messages |
| Heart (Crimson) | `#AE0A46` | 1945 C | Hover states, gradient midpoint |
| Harmony (Purple) | `#582873` | 269 C | Nav, headers, structural elements |
| Zeal (Blue) | `#5990F0` | 2381 C | Links, interactive elements |
| Vision (Cyan) | `#4EC7EA` | 2198 C | Tags, badges, highlights |

> ⚠️ Note: `#721357` appears in some external sources for Harmony — this is incorrect. Verified value is `#582873`.

---

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── Chat/           # Chat interface, message bubbles, typing indicator
│   │   ├── Admin/          # Password-gated knowledge base manager
│   │   └── About/          # Static portfolio context page
│   ├── lib/
│   │   ├── supabase.ts     # Supabase client & knowledge retrieval
│   │   ├── openai.ts       # OpenAI API integration & system prompt
│   │   └── knowledge.functions.ts  # Admin CRUD operations
│   └── routes/
│       ├── chat.tsx        # Main chat view (default landing)
│       ├── about.tsx       # About page with capstone section cards
│       └── admin.tsx       # Password-protected admin panel
├── docs/
│   └── build-process/      # Full build process documentation
│       ├── prompt-engineering-log.md
│       ├── bug-log.md
│       ├── credit-tracker.md
│       ├── project-brief.md
│       ├── architecture.md
│       └── weekly-journal.md
└── README.md               # This file
```

---

## 📖 Build Process Documentation

Full documentation lives in [`/docs/build-process/`](./docs/build-process/) and covers:

- **Prompt Engineering Log** — every prompt sent to Lovable, credit cost, and what it produced
- **Bug Log** — every bug encountered, root cause, and resolution
- **Credit Usage Tracker** — running log of every Lovable credit spent and its ROI
- **Project Brief** — problem, vision, decision framework, and success criteria
- **Technical Architecture** — system design, DB schema, retrieval pipeline
- **Week-by-Week Build Journal** — running diary across the 10-week internship

> This documentation is intentionally thorough — it demonstrates the same analytical and communication skills required of a great Account Executive.

---

## 🔧 Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

> ⚠️ All secrets managed via Lovable's Secrets panel — never committed to the repository.

---

## 🔒 Data Security

- ✅ Personal reflections, learnings, and analysis — included
- ✅ High-level account context and public industry research — included
- ⚠️ Specific client names and deal details — summarized and anonymized
- ❌ Internal Insight pricing, proprietary strategy, or client PII — excluded

---

## 📅 Build Timeline

| Week | Milestone | Status |
|---|---|---|
| **Week 5** | App scaffolded — brand design system, 3-view nav, chat UI, Admin panel | ✅ Complete |
| **Week 6** | Supabase connected, retrieval pipeline fixed, OpenAI API wired in | 🔴 In Progress |
| **Week 7** | Knowledge base populated, UI polish | ⬜ Upcoming |
| **Week 8** | User testing, stakeholder feedback, edge case refinement | ⬜ Upcoming |
| **Week 9** | Portfolio write-up, custom domain, final polish | ⬜ Upcoming |
| **Week 10** | Capstone presentation with live demo | ⬜ Upcoming |

---

## 💡 Key Learnings

**On prompt engineering:**
> A comprehensive, highly-specified opening prompt produced a near-complete app scaffold in a single 5.6-credit action. Planning the prompt outside Lovable (with Amelia on Horizon) cost zero credits — the highest-ROI decision of the project.

**On debugging:**
> Diagnose before you fix. Checking Supabase Table Editor directly cost zero credits and identified the root cause instantly — saving multiple fix attempts and preserving the monthly credit budget.

**On building with a lapsed coding background:**
> You need enough mental model to understand what's happening, but you don't need to write a single line from scratch. You're the architect, not the typist.

**On AI tool selection:**
> The right tool depends on the goal. Horizon Custom Insights would have been faster — but a public portfolio URL that survives beyond the internship required an external build.

---

## 🔮 Future Improvements

- [ ] Vector/semantic search for better answer quality
- [ ] Conversation memory for more natural multi-turn chat
- [ ] Custom domain
- [ ] Analytics dashboard — see what questions visitors ask most
- [ ] Export conversation feature

---

## 👤 About

**Avery Liao-Troth**
Account Executive Intern — Insight Enterprises, 2026 GTM Sales Internship
📧 Avery.Liao-Troth@insight.com
🔗 [GitHub](https://github.com/averyliaotroth/Insight-Internship-2026)
🤖 [Live Agent](https://avery-insight-intern-agent.lovable.app)

---

*Built during the Insight Enterprises 2026 GTM Sales Account Executive Internship Program.*
*All client information has been anonymized in accordance with Insight's data governance guidelines.*
