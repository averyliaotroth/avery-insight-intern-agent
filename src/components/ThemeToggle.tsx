import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type Theme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: "light", icon: <Sun size={13} />, label: "Light" },
    { value: "system", icon: <Monitor size={13} />, label: "System" },
    { value: "dark", icon: <Moon size={13} />, label: "Dark" },
  ];

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-[var(--border)] bg-[var(--card)] p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          title={opt.label}
          className={`
            flex items-center justify-center w-7 h-7 rounded-full 
            transition-all duration-200
            ${theme === opt.value
              ? "bg-[var(--harmony)] text-white shadow-sm"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }
          `}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
