/** カテゴリ表示名（デフォルトタグ） */
export const DEFAULT_CATEGORIES = ["ご飯", "観光", "その他"] as const;

type CategoryKey = (typeof DEFAULT_CATEGORIES)[number];

/** カテゴリに対応するバッジ・ボーダー用 Tailwind クラス */
const CATEGORY_STYLES: Record<
  string,
  { badge: string; border: string; button: string }
> = {
  ご飯: {
    badge:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
    border:
      "border-l-amber-400 dark:border-l-amber-500",
    button:
      "bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600",
  },
  観光: {
    badge:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
    border:
      "border-l-emerald-400 dark:border-l-emerald-500",
    button:
      "bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600",
  },
  その他: {
    badge:
      "bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-200",
    border:
      "border-l-slate-400 dark:border-l-slate-500",
    button:
      "bg-slate-500 text-white hover:bg-slate-600 dark:bg-slate-600",
  },
};

const FALLBACK = CATEGORY_STYLES["その他"];

export function getCategoryStyle(category: string): {
  badge: string;
  border: string;
  button: string;
} {
  const key = category?.trim() || "その他";
  return CATEGORY_STYLES[key] ?? FALLBACK;
}
