"use client";

import { useState, useCallback } from "react";
import type { Board } from "@/lib/api";
import { createLink } from "@/lib/api";
import { getCurrentUser, setCurrentUser } from "@/lib/localStorage";
import type { Link } from "@/lib/api";
import {
  DEFAULT_CATEGORIES,
  getCategoryStyle,
} from "@/lib/categories";

type Props = {
  boardId: string;
  board: Board;
  onLinksUpdate: (links: Link[]) => void;
};

export function LinkInputBar({ boardId, board, onLinksUpdate }: Props) {
  const [url, setUrl] = useState("");
  const members = board.members.length > 0 ? board.members : ["自分"];
  const tags = board.tags?.length ? board.tags : [...DEFAULT_CATEGORIES];

  const [selectedMember, setSelectedMember] = useState(() => getCurrentUser() ?? board.members[0] ?? "");
  const [selectedCategory, setSelectedCategory] = useState<string>(tags[0] ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = url.trim();
    if (!trimmed) return;
    const member = selectedMember || members[0];
    setCurrentUser(member);
    setLoading(true);
    try {
      const links = await createLink(boardId, trimmed, selectedCategory, member);
      onLinksUpdate(links);
      setUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "追加に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [boardId, url, selectedMember, selectedCategory, members, onLinksUpdate]);

  return (
    <div className="sticky top-[57px] z-10 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/95">
      <form onSubmit={handleAdd} className="mx-auto max-w-4xl space-y-3 px-4 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
          <div className="flex min-h-[44px] flex-wrap items-center gap-2 sm:flex-nowrap">
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-amber-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {members.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <div className="flex gap-1 rounded-lg border border-slate-300 bg-slate-50 p-1 dark:border-slate-600 dark:bg-slate-800">
              {tags.map((tag) => {
                const style = getCategoryStyle(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedCategory(tag)}
                    className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition ${
                      selectedCategory === tag
                        ? style.button
                        : "text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="shrink-0 rounded-xl bg-amber-500 px-4 py-2.5 font-medium text-white shadow-lg shadow-amber-500/25 transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-60 dark:focus:ring-offset-slate-900"
            >
              {loading ? "追加中…" : "追加"}
            </button>
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </form>
    </div>
  );
}
