"use client";

import { useState, useCallback, useEffect } from "react";
import type { Board } from "@/lib/api";
import { updateBoard } from "@/lib/api";

type Props = {
  board: Board;
  boardId: string;
  onBoardUpdate: (board: Board) => void;
};

export function BoardHeader({ board, boardId, onBoardUpdate }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(board.title);
  const [editMembers, setEditMembers] = useState<string[]>(board.members);
  const [editTags, setEditTags] = useState<string[]>(board.tags ?? []);
  const [newMemberInput, setNewMemberInput] = useState("");
  const [newTagInput, setNewTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setEditTitle(board.title);
    setEditMembers([...board.members]);
    setEditTags([...(board.tags ?? [])]);
  }, [board.title, board.members, board.tags]);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/board/${boardId}`
      : "";

  const openEdit = useCallback(() => {
    setEditTitle(board.title);
    setEditMembers([...board.members]);
    setEditTags([...(board.tags ?? [])]);
    setNewMemberInput("");
    setNewTagInput("");
    setError("");
    setEditOpen(true);
  }, [board.title, board.members, board.tags]);

  const addMember = () => {
    const name = newMemberInput.trim();
    if (!name) return;
    if (editMembers.includes(name)) return;
    setEditMembers((m) => [...m, name]);
    setNewMemberInput("");
  };
  const removeMember = (i: number) =>
    setEditMembers((m) => m.filter((_, idx) => idx !== i));

  const addTag = () => {
    const name = newTagInput.trim();
    if (!name) return;
    if (editTags.includes(name)) return;
    setEditTags((t) => [...t, name]);
    setNewTagInput("");
  };
  const removeTag = (i: number) =>
    setEditTags((t) => t.filter((_, idx) => idx !== i));

  const handleSaveEdit = useCallback(async () => {
    setError("");
    if (!editTitle.trim()) {
      setError("タイトルを入力してください");
      return;
    }
    if (editMembers.length === 0) {
      setError("メンバーを1人以上にしてください");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateBoard(boardId, {
        title: editTitle.trim(),
        members: editMembers,
        tags: editTags,
      });
      onBoardUpdate(updated);
      setEditOpen(false);
    } catch {
      setError("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }, [boardId, editTitle, editMembers, editTags, onBoardUpdate]);

  const handleShareLink = useCallback(() => {
    if (!shareUrl) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: board.title,
        text: `「${board.title}」のリンク`,
        url: shareUrl,
      }).catch(() => {
        navigator.clipboard.writeText(shareUrl);
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
  }, [shareUrl, board.title]);

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <a
            href="/"
            className="shrink-0 rounded-lg px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            トップ
          </a>
          <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-slate-800 dark:text-slate-100">
            {board.title}
          </h1>
          <button
            type="button"
            onClick={openEdit}
            className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="ボードを編集"
            aria-label="ボードを編集"
          >
            <EditIcon />
          </button>
          <button
            type="button"
            onClick={handleShareLink}
            className="shrink-0 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            リンクを共有
          </button>
        </div>
      </header>

      {/* Edit modal */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !saving && setEditOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
              ボードを編集
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  旅行タイトル
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="例: 韓国旅行"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  メンバー
                </label>
                <div className="flex flex-wrap gap-2">
                  {editMembers.map((name, i) => (
                    <span
                      key={`${name}-${i}`}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-1 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {name}
                      <button
                        type="button"
                        onClick={() => removeMember(i)}
                        disabled={editMembers.length <= 1}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-40 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                        aria-label={`${name}を削除`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="名前を入力して追加"
                    value={newMemberInput}
                    onChange={(e) => setNewMemberInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMember())}
                    className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={addMember}
                    className="shrink-0 rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
                  >
                    追加
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  カテゴリ（タブ）
                </label>
                <div className="flex flex-wrap gap-2">
                  {editTags.map((name, i) => (
                    <span
                      key={`tag-${name}-${i}`}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-1 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {name}
                      <button
                        type="button"
                        onClick={() => removeTag(i)}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                        aria-label={`${name}を削除`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="例: 香川"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="shrink-0 rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
                  >
                    追加
                  </button>
                </div>
              </div>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => !saving && setEditOpen(false)}
                className="flex-1 rounded-xl border border-slate-300 py-2.5 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 rounded-xl bg-amber-500 py-2.5 font-medium text-white hover:bg-amber-600 disabled:opacity-60"
              >
                {saving ? "保存中…" : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EditIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}
