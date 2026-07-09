export const CATEGORY_COLORS: Record<string, string> = {
  "Account Overview":
    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  "My Role":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  "Key Experiences":
    "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  "Strategic Thinking & Business Impact":
    "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  "Tools, Technology, & AI":
    "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
  "Outcomes & Future State":
    "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900 dark:text-fuchsia-300",
  "Growth & Learnings":
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  "Looking Forward":
    "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  "Research":
    "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
  "This Agent":
    "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
};

export function categoryPillClass(category: string): string {
  return (
    CATEGORY_COLORS[category] ??
    "bg-[var(--harmony-lite)] text-[var(--harmony)]"
  );
}
