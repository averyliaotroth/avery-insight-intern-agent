import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · Avery Liao-Troth | Insight 2026" },
      {
        name: "description",
        content:
          "About Avery Liao-Troth, an Account Executive Intern at Insight, and the AI agent built on her internship experience.",
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
    title: "Tools, Technology, & AI",
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

      {/* PAGE HEADER */}
      <header>
        <h1 className="text-4xl sm:text-5xl font-bold
          text-[var(--harmony)] tracking-tight">
          Avery Liao-Troth
        </h1>
        <p className="mt-3 text-[20px]
          text-[var(--muted-foreground)]">
          Account Executive Intern, Insight 2026
        </p>
        <div className="mt-6 h-[3px] w-full
          bg-insight-gradient rounded-full" />
      </header>

      {/* TOP TWO CARDS */}
      <section className="grid md:grid-cols-2 gap-8 mt-12">

        {/* LEFT CARD — Photo */}
        <div className="bg-[var(--card)] rounded-[12px] shadow-card p-6
          flex flex-col items-center justify-center">
          <img
            src="https://raw.githubusercontent.com/averyliaotroth/avery-insight-intern-agent/main/public/avery-headshot.jpeg"
            alt="Avery Liao-Troth"
            className="w-[280px] h-[280px]
              rounded-[12px] object-cover object-top"
          />
          <p className="mt-4 text-[15px] font-semibold
            text-[var(--harmony)] text-center">
            Avery Liao-Troth
          </p>
          <p className="mt-1 text-[13px]
            text-[var(--muted-foreground)] text-center">
            Account Executive Intern
          </p>
          <p className="mt-1 text-[13px]
            text-[var(--muted-foreground)] text-center">
            Insight, 2026
          </p>
        </div>
        {/* END LEFT CARD */}

        {/* RIGHT CARD — About This Agent */}
        <div className="bg-[var(--card)] rounded-[12px] shadow-card p-6">
          <h2 className="text-xl font-semibold
            text-[var(--harmony)]">
            About This Agent
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed
            text-[var(--neutral-ink)]">
            This agent was designed and built by Avery as
            her internship capstone at Insight Enterprises.
            It uses a retrieval-augmented generation
            architecture, pulling from a curated knowledge
            base of her real research and reflections before
            every response, so answers are always grounded
            in documented experience, never invented.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed
            text-[var(--neutral-ink)]">
            The tech stack includes React, Supabase,
            OpenAI's gpt-4o-mini, and Lovable as the build
            platform. Every response is generated only after
            querying the live knowledge base, ensuring
            accuracy and specificity across every
            conversation.
          </p>
          <div className="mt-5">
            <h3 className="text-sm font-semibold
              text-[var(--neutral-ink)] mb-2">
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {["React", "Supabase", "OpenAI API",
                "Lovable"].map((t) => (
                <span
                  key={t}
                  className="bg-[var(--vision)] text-white
                    text-[12px] font-medium px-3 py-1
                    rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        {/* END RIGHT CARD */}

      </section>

      {/* FULL WIDTH BIO */}
      <section className="mt-8">
        <div className="bg-[var(--card)] rounded-[12px] shadow-card p-6">
          <h2 className="text-xl font-semibold
            text-[var(--harmony)]">
            About the Intern
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed
            text-[var(--neutral-ink)]">
            Avery Liao-Troth has built robots, run financial
            analysis, designed product prototypes, conducted
            archaeological fieldwork, and piloted a Disney
            monorail. The throughline is not chaos. It is
            curiosity. Every role has been about
            understanding how people, systems, and problems
            fit together, and then building something better.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed
            text-[var(--neutral-ink)]">
            She studied people before she studied business,
            and that is exactly why she thinks about
            technology differently. An anthropology degree
            from the University of Florida and a Master's
            in Management from the University of Central
            Florida gave her something most builders do not
            have, a framework for understanding the humans
            on the other side of every product decision.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed
            text-[var(--neutral-ink)]">
            This summer she joined Insight as an Account
            Executive Intern, where she explored how AI is 
            reshaping the way businesses operate and built
            this agent as her capstone project, a
            full-stack AI product designed, architected,
            and shipped from scratch.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed
            text-[var(--neutral-ink)]">
            Avery lives and works at the intersection of
            people, technology, design, and business. That
            Venn diagram is not a compromise. It is
            the point.
          </p>
        </div>
      </section>

      {/* 8 CAPSTONE AREAS */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold
          text-[var(--harmony)] tracking-tight">
          The 8 Capstone Areas
        </h2>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Mapped directly to the official 2026 GTM Sales
          Capstone requirements.
        </p>
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          {CAPSTONES.map((c, i) => (
            <div
              key={c.title}
              className="bg-[var(--hunger-lite)]
                border border-[var(--harmony)]/30
                rounded-[12px] p-5"
            >
              <div className="text-[12px] font-semibold
                text-[var(--harmony)]/70 mb-1">
                0{i + 1}
              </div>
              <h3 className="font-semibold
                text-[var(--harmony)] text-[16px]">
                {c.title}
              </h3>
              <p className="mt-1.5 text-[14px]
                text-[var(--neutral-ink)] leading-relaxed">
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
