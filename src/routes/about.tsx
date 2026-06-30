import { createFileRoute } from "@tanstack/react-router";
import { Camera } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · Avery Liao-Troth | Insight Enterprises 2026" },
      {
        name: "description",
        content:
          "About Avery Liao-Troth, an Account Executive Intern in the 2026 GTM Sales Internship at Insight Enterprises, and the AI agent built on their internship experience.",
      },
    ],
  }),
  component: AboutPage,
});

const CAPSTONES: { title: string; desc: string }[] = [
  {
    title: "Account Overview",
    desc: "The client, their industry, and the opportunity the account team was focused on.",
  },
  {
    title: "My Role in the Account Journey",
    desc: "How I contributed through research, planning, call prep, and account strategy.",
  },
  {
    title: "Key Experiences",
    desc: "The most meaningful projects, calls, and relationships that shaped my internship.",
  },
  {
    title: "Sales Thinking & Account Impact",
    desc: "How Insight was positioned to help, and where my work moved the needle.",
  },
  {
    title: "Tools, Technology & AI",
    desc: "The tools and AI I used to work smarter and support the account team.",
  },
  {
    title: "Outcomes & Future State",
    desc: "What was delivered, the value created, and what the client's future could look like.",
  },
  {
    title: "Growth & Takeaways",
    desc: "What I learned about sales, strategy, and my own development.",
  },
  {
    title: "Looking Forward",
    desc: "How this experience prepared me for a full-time Account Executive role.",
  },
];

function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <header>
        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--harmony)] tracking-tight">
          Avery Liao-Troth
        </h1>
        <p className="mt-3 text-[20px] text-[var(--muted-foreground)]">
          Account Executive Intern — Insight Enterprises, 2026 GTM Sales Internship
        </p>
        <div className="mt-6 h-[3px] w-full bg-insight-gradient rounded-full" />
      </header>

      <section className="grid md:grid-cols-2 gap-8 mt-12">
        <div className="bg-white rounded-[12px] shadow-card p-6">
          <h2 className="text-xl font-semibold text-[var(--harmony)]">About the Intern</h2>
          <div className="mt-4 w-[200px] h-[200px] rounded-[12px] bg-[var(--clarity)] flex items-center justify-center text-[var(--muted-foreground)]">
            <Camera className="w-10 h-10" />
          </div>
          <p className="mt-5 text-[15px] leading-relaxed text-[var(--neutral-ink)]">
            [Avery's bio and background will go here]
          </p>
        </div>

        <div className="bg-white rounded-[12px] shadow-card p-6">
          <h2 className="text-xl font-semibold text-[var(--harmony)]">About This Agent</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--neutral-ink)]">
            This AI agent was built as a capstone project for the 2026 GTM Sales Internship at
            Insight Enterprises. It is grounded in a curated knowledge base of Avery's real research,
            reflections, and account work — so every answer comes straight from the documented
            internship experience.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--neutral-ink)]">
            [Project description will go here]
          </p>
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-[var(--neutral-ink)] mb-2">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {["React", "Supabase", "OpenAI API", "Lovable"].map((t) => (
                <span
                  key={t}
                  className="bg-[var(--vision)] text-white text-[12px] font-medium px-3 py-1 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-bold text-[var(--harmony)] tracking-tight">
          The 8 Capstone Areas
        </h2>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Mapped directly to the official 2026 GTM Sales Capstone requirements.
        </p>
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          {CAPSTONES.map((c, i) => (
            <div
              key={c.title}
              className="bg-[var(--hunger-lite)] border border-[var(--harmony)]/30 rounded-[12px] p-5"
            >
              <div className="text-[12px] font-semibold text-[var(--harmony)]/70 mb-1">
                0{i + 1}
              </div>
              <h3 className="font-semibold text-[var(--harmony)] text-[16px]">{c.title}</h3>
              <p className="mt-1.5 text-[14px] text-[var(--neutral-ink)] leading-relaxed">
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
