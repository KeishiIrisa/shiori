"use client";

import { useRef, useCallback, useState } from "react";
import Image from "next/image";
import type { Link } from "@/lib/api";
import { deleteLink, toggleReaction } from "@/lib/api";
import { getCategoryStyle } from "@/lib/categories";

const REACTION_EMOJIS = ["👍", "🔥", "❤️", "😋"];
const LONG_PRESS_MS = 1500;

type Props = {
  link: Link;
  boardId: string;
  currentMember: string;
  onLinkUpdate: (updated: Link) => void;
  onLinkDelete: (linkId: string) => void;
};

function faviconUrl(domain: string): string {
  if (!domain) return "/favicon.ico";
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

function NoImagePlaceholder() {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200/80 dark:from-slate-700 dark:to-slate-800/80">
      <svg
        className="h-12 w-12 text-slate-400 dark:text-slate-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
        No Image
      </span>
    </div>
  );
}

export function LinkCard({
  link,
  boardId,
  currentMember,
  onLinkUpdate,
  onLinkDelete,
}: Props) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleReaction = async (emoji: string) => {
    try {
      const updated = await toggleReaction(
        boardId,
        link.id,
        emoji,
        currentMember
      );
      onLinkUpdate(updated);
    } catch {
      // ignore
    }
  };

  const hasReaction = (emoji: string) =>
    link.reactions?.[emoji]?.includes(currentMember);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const showDeleteModal = useCallback(() => {
    setDeleteModalOpen(true);
  }, []);

  const handleLongPressStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      longPressTimer.current = null;
      showDeleteModal();
    }, LONG_PRESS_MS);
  }, [showDeleteModal]);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      showDeleteModal();
    },
    [showDeleteModal]
  );

  const handleConfirmDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await deleteLink(boardId, link.id);
      onLinkDelete(link.id);
      setDeleteModalOpen(false);
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  }, [boardId, link.id, onLinkDelete]);

  const categoryStyle = getCategoryStyle(link.category);

  return (
    <article
      className="select-none break-inside-avoid rounded-2xl border border-slate-200/80 bg-white/80 shadow-lg shadow-slate-200/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl dark:border-slate-700/80 dark:bg-slate-800/80 dark:shadow-slate-900/50"
      onContextMenu={handleContextMenu}
      onTouchStart={handleLongPressStart}
      onTouchEnd={handleLongPressEnd}
      onTouchCancel={handleLongPressEnd}
    >
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-t-2xl"
      >
        {link.image_url ? (
          <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
            <Image
              src={link.image_url}
              alt=""
              fill
              className="object-cover transition hover:scale-[1.02]"
              sizes="(max-width: 768px) 50vw, 20vw"
              unoptimized
            />
          </div>
        ) : (
          <NoImagePlaceholder />
        )}
      </a>
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <img
            src={faviconUrl(link.domain)}
            alt=""
            width={16}
            height={16}
            className="shrink-0 rounded"
          />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {link.added_by}
          </span>
        </div>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <h3 className="mb-1 font-semibold text-slate-800 line-clamp-2 dark:text-slate-100">
            {link.title || link.url}
          </h3>
          {link.description && (
            <p className="text-sm text-slate-600 line-clamp-3 dark:text-slate-400">
              {link.description}
            </p>
          )}
        </a>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryStyle.badge}`}
          >
            {link.category}
          </span>
          <div className="flex gap-1">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleReaction(emoji)}
                className={`rounded-lg px-2 py-1 text-sm transition ${
                  hasReaction(emoji)
                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          {Object.entries(link.reactions ?? {}).map(([emoji, names]) => {
            const list = Array.isArray(names) ? names : [];
            return list.length > 0 ? (
              <span
                key={emoji}
                className="text-xs text-slate-500 dark:text-slate-400"
              >
                {emoji} {list.length}
              </span>
            ) : null;
          })}
        </div>
      </div>

      {/* 削除確認モーダル（長押し or 右クリックで表示） */}
      {deleteModalOpen && (
        <div
          className="select-none fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !deleting && setDeleteModalOpen(false)}
        >
          <div
            className="select-none w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-4 text-slate-800 dark:text-slate-100">
              このリンクを削除しますか？
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => !deleting && setDeleteModalOpen(false)}
                className="flex-1 rounded-xl border border-slate-300 py-2.5 font-medium text-slate-700 dark:border-slate-600 dark:text-slate-300"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-500 py-2.5 font-medium text-white hover:bg-red-600 disabled:opacity-60"
              >
                {deleting ? "削除中…" : "削除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
