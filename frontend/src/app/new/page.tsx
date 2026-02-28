"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { createBoard } from "@/lib/api";
import { getOrCreateDeviceId } from "@/lib/deviceId";
import { setCurrentUser } from "@/lib/localStorage";

export default function NewBoardPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [memberChips, setMemberChips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addMember = () => {
    const name = memberInput.trim();
    if (!name) return;
    if (memberChips.includes(name)) return;
    setMemberChips((prev) => [...prev, name]);
    setMemberInput("");
  };

  const removeMember = (i: number) => {
    setMemberChips((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("旅行タイトルを入力してください");
      return;
    }
    if (memberChips.length === 0) {
      setError("メンバーを1人以上追加してください");
      return;
    }
    setLoading(true);
    try {
      const deviceId = getOrCreateDeviceId();
      const { board_id } = await createBoard(title.trim(), memberChips, deviceId);
      if (memberChips[0]) setCurrentUser(memberChips[0]);
      router.push(`/board/${board_id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "ボードの作成に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-amber-950/20">
      <header className="border-b border-slate-200/80 bg-white/80 dark:border-slate-700/80 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            トップ
          </Link>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            新しいボード
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-md px-6 py-8">
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-8 dark:border-slate-700/80 dark:bg-slate-900/80">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label
                htmlFor="title"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                旅行タイトル
              </label>
              <input
                id="title"
                type="text"
                placeholder="例: 韓国旅行"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                メンバー
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="名前を入力"
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMember())}
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={addMember}
                  className="shrink-0 rounded-xl bg-amber-500 px-5 py-3 font-medium text-white shadow-md transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                >
                  追加
                </button>
              </div>
              {memberChips.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {memberChips.map((name, i) => (
                    <span
                      key={`${name}-${i}`}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-1 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {name}
                      <button
                        type="button"
                        onClick={() => removeMember(i)}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                        aria-label={`${name}を削除`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                リンクを追加するときに「誰が追加したか」を選べます
              </p>
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-500 px-4 py-3 font-medium text-white shadow-lg shadow-amber-500/25 transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-60 dark:focus:ring-offset-slate-900"
            >
              {loading ? "作成中…" : "ボードを作成"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
