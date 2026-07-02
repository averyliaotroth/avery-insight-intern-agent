import { Link, useRouterState } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";

export function NavBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const link = (to: string, label: string) => {
    const active = pathname === to;
    return (
      <Link
        to={to}
        className={`relative px-3 py-2 text-sm font-medium transition-colors ${
          active ? "text-[var(--harmony)]" : "text-[var(--neutral-ink)] hover:text-[var(--hunger)]"
        }`}
      >
        {label}
        {active && (
          <span className="absolute left-3 right-3 -bottom-[1px] h-[2px] rounded-full bg-[var(--hunger)]" />
        )}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--card)] border-b border-[var(--border)]">
      <div className="mx-auto max-w-6xl h-16 px-6 flex items-center justify-between">
        <Link to="/" className="font-bold text-[18px] text-[var(--harmony)] tracking-tight">
          Avery Liao-Troth
        </Link>
        <nav className="flex items-center gap-1">
          {link("/", "Chat")}
          {link("/about", "About")}
          {link("/admin", "Admin")}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden sm:block">
            <span className="bg-insight-gradient text-white text-[12px] font-medium px-3 py-1.5 rounded-full">
              AE Intern '26 · Insight
            </span>
          </div>
        </div>
      </div>
      <div className="h-[3px] bg-insight-gradient" />
    </header>
  );
}
