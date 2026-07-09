export const CATEGORY_COLORS: Record<string, string> = {
  "Account Overview":
    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  "My Role":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  "Key Experiences":
    "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  "Strategic Thinking & Business Impact":
    "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  "Tools, Technology, & AI":
    "bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-700",
  "Outcomes & Future State":
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  "Growth & Learnings":
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  "Looking Forward":
    "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
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
