"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { listMyBoards, type Board } from "@/lib/api";
import { getOrCreateDeviceId } from "@/lib/deviceId";

const INITIAL_RECENT_COUNT = 3;

export default function Home() {
  const [recentBoards, setRecentBoards] = useState<Board[]>([]);
  const [showAllRecent, setShowAllRecent] = useState(false);

  useEffect(() => {
    const deviceId = getOrCreateDeviceId();
    listMyBoards(deviceId, 20).then(setRecentBoards);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-amber-950/20">
      {/* Hero */}
      <main className="mx-auto max-w-3xl px-6 pt-16 pb-12 text-center md:pt-24 md:pb-16">
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-amber-500 dark:text-amber-400 md:text-5xl">
          Shiori
        </h1>
        <p className="mb-8 text-2xl font-bold tracking-tight text-black dark:text-white md:text-3xl lg:text-4xl">
          旅行のリンクを、ひとつのボードに。
        </p>
        <div className="mx-auto mb-8 max-w-sm md:max-w-md">
          <img
            src="/undraw_travelers_kud9.svg"
            alt=""
            className="w-full"
            width={923}
            height={659}
          />
        </div>
        <p className="mb-10 text-slate-600 dark:text-slate-400">
          飲食店・観光地・アクティビティ…計画中に飛び交うURLを1つのリンクに集約して、友達と共有・リアクションで意思決定できます。ログインもインストールも不要です。
        </p>
        <Link
          href="/new"
          className="inline-block rounded-xl bg-amber-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-amber-500/25 transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          始める
        </Link>

        {/* 最近のボード（始めるの直下・通常フロー） */}
        {recentBoards.length > 0 && (
          <section className="mx-auto mt-12 max-w-md text-left">
            <h2 className="mb-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
              最近のボード
            </h2>
            <ul className="space-y-2">
              {(showAllRecent ? recentBoards : recentBoards.slice(0, INITIAL_RECENT_COUNT)).map(
                (b) => (
                  <li key={b.id}>
                    <Link
                      href={`/board/${b.id}`}
                      className="block rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-800 transition hover:border-amber-300 hover:bg-amber-50/50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:border-amber-600 dark:hover:bg-amber-950/30"
                    >
                      <span className="font-medium">{b.title}</span>
                      {b.members?.length > 0 && (
                        <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                          — {b.members.join(", ")}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              )}
            </ul>
            {recentBoards.length > INITIAL_RECENT_COUNT && !showAllRecent && (
              <button
                type="button"
                onClick={() => setShowAllRecent(true)}
                className="mt-4 w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                さらに表示する
              </button>
            )}
          </section>
        )}
      </main>

      {/* Features */}
      <section className="border-t border-slate-200/80 bg-white/50 dark:border-slate-700/80 dark:bg-slate-900/30">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="grid gap-12 md:grid-cols-3">
            <FeatureCard
              label="特徴その1"
              title="ログイン不要！"
              description="メール登録やSNS連携は一切なし。名前を入れるだけで、すぐにボードを作って共有できます。"
              icon="🔐"
            />
            <FeatureCard
              label="特徴その2"
              title="インストール不要！"
              description="ブラウザだけで完結。スマホでもPCでも、URLを開くだけで使えます。"
              icon="📱"
            />
            <FeatureCard
              label="特徴その3"
              title="1つのURLで共有"
              description="ボードのリンク1つを送るだけで、友達全員が同じリンク一覧を見て、リアクションで「行きたい！」を伝えられます。"
              icon="🔗"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200/80 py-8 dark:border-slate-700/80">
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Shiori — 旅行リンクボード
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({
  label,
  title,
  description,
  icon,
}: {
  label: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white/80 p-6 text-center shadow-sm dark:border-slate-700/80 dark:bg-slate-800/50">
      <span className="mb-3 block text-xs font-bold text-amber-500 dark:text-amber-400">
        {label}
      </span>
      <p className="mb-3 text-3xl">{icon}</p>
      <h2 className="mb-2 font-bold text-slate-800 dark:text-slate-100">
        {title}
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}
