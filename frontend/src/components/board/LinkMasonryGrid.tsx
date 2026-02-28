"use client";

import type { Link } from "@/lib/api";
import { LinkCard } from "./LinkCard";

type Props = {
  links: Link[];
  boardId: string;
  currentMember: string;
  onLinkUpdate: (updated: Link) => void;
  onLinkDelete: (linkId: string) => void;
};

export function LinkMasonryGrid({
  links,
  boardId,
  currentMember,
  onLinkUpdate,
  onLinkDelete,
}: Props) {
  if (links.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-slate-500 dark:text-slate-400">
          URLを追加するとここに表示されます
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="columns-2 gap-3 sm:gap-4 sm:columns-3 md:columns-4 lg:columns-5">
        {links.map((link) => (
          <div key={link.id} className="mb-3 break-inside-avoid sm:mb-4">
            <LinkCard
              link={link}
              boardId={boardId}
              currentMember={currentMember}
              onLinkUpdate={onLinkUpdate}
              onLinkDelete={onLinkDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
