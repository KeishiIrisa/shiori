"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

import {
  getBoard,
  listLinks,
  type Board,
  type Link,
} from "@/lib/api";
import { getCurrentUser } from "@/lib/localStorage";

import { BoardHeader } from "@/components/board/BoardHeader";
import { LinkInputBar } from "@/components/board/LinkInputBar";
import { LinkMasonryGrid } from "@/components/board/LinkMasonryGrid";

export default function BoardPage() {
  const params = useParams();
  const boardId = typeof params.boardId === "string" ? params.boardId : "";

  const [board, setBoard] = useState<Board | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentMember = getCurrentUser() ?? board?.members?.[0] ?? "自分";

  const loadBoard = useCallback(async () => {
    if (!boardId) return;
    try {
      const b = await getBoard(boardId);
      setBoard(b);
    } catch {
      setError("ボードが見つかりません");
    }
  }, [boardId]);

  const loadLinks = useCallback(async () => {
    if (!boardId) return;
    try {
      const list = await listLinks(boardId);
      setLinks(list);
    } catch {
      setLinks([]);
    }
  }, [boardId]);

  useEffect(() => {
    if (!boardId) {
      setLoading(false);
      setError("不正なURLです");
      return;
    }
    setLoading(true);
    setError("");
    Promise.all([loadBoard(), loadLinks()]).finally(() => setLoading(false));
  }, [boardId, loadBoard, loadLinks]);

  const handleLinkUpdate = useCallback((updated: Link) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === updated.id ? updated : l))
    );
  }, []);

  const handleLinkDelete = useCallback((linkId: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== linkId));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-500 dark:text-slate-400">読み込み中…</p>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 dark:bg-slate-950">
        <p className="text-slate-600 dark:text-slate-400">
          {error || "ボードを読み込めませんでした"}
        </p>
        <a
          href="/"
          className="rounded-xl bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600"
        >
          トップへ
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-amber-950/10">
      <BoardHeader
        board={board}
        boardId={boardId}
        onBoardUpdate={setBoard}
      />
      <LinkInputBar
        boardId={boardId}
        board={board}
        onLinksUpdate={setLinks}
      />
      <LinkMasonryGrid
        links={links}
        boardId={boardId}
        currentMember={currentMember}
        onLinkUpdate={handleLinkUpdate}
        onLinkDelete={handleLinkDelete}
      />
    </div>
  );
}
