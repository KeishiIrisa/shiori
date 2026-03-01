/** カテゴリ表示名（デフォルトタグ） */
export const DEFAULT_CATEGORIES = ["ご飯", "観光", "その他"] as const;

/** 動的色割り当て用のパレット（badge / button 用 Tailwind クラス） */
const COLOR_PALETTE: { badge: string; button: string }[] = [
  {
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
    button: "bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600",
  },
  {
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
    button: "bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600",
  },
  {
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-200",
    button: "bg-slate-500 text-white hover:bg-slate-600 dark:bg-slate-600",
  },
  {
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
    button: "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600",
  },
  {
    badge: "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200",
    button: "bg-violet-500 text-white hover:bg-violet-600 dark:bg-violet-600",
  },
  {
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200",
    button: "bg-rose-500 text-white hover:bg-rose-600 dark:bg-rose-600",
  },
  {
    badge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200",
    button: "bg-cyan-500 text-white hover:bg-cyan-600 dark:bg-cyan-600",
  },
  {
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200",
    button: "bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600",
  },
];

/** 文字列から一貫したインデックスを生成（同じ文字列は常に同じ色） */
function hashToIndex(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** カテゴリのバッジ・ボタン用クラスを動的に返す（文字列ハッシュでパレットから選択） */
export function getCategoryStyle(category: string): {
  badge: string;
  border: string;
  button: string;
} {
  const key = category?.trim() || "その他";
  const idx = hashToIndex(key) % COLOR_PALETTE.length;
  const style = COLOR_PALETTE[idx];
  return {
    badge: style.badge,
    border: "", // 横のカラー線は廃止済み
    button: style.button,
  };
}
