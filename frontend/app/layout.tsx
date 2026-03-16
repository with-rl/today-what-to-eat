import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "오늘 뭐 먹지?",
  description: "팀 점심 메뉴를 빠르고 공평하게 정하는 투표 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50`}
      >
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-zinc-200 bg-white/70 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
            <div className="mx-auto flex max-w-5xl items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 via-rose-400 to-fuchsia-500 text-sm font-semibold text-zinc-950 shadow-sm dark:text-zinc-900">
                  🍱
                </span>
                <div className="leading-tight">
                  <span className="block text-sm font-semibold tracking-tight">
                    오늘 뭐 먹지?
                  </span>
                  <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                    팀 점심 메뉴를 빠르게 정하는 투표 서비스
                  </span>
                </div>
              </div>
              <nav className="hidden items-center gap-4 text-xs font-medium text-zinc-600 dark:text-zinc-300 sm:flex">
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-50">
                  1인 1표 메뉴 투표
                </span>
                <span className="hidden text-zinc-500 dark:text-zinc-400 md:inline">
                  최근 메뉴 이력으로 메뉴 편식 방지
                </span>
              </nav>
            </div>
          </header>

          <main className="flex-1 bg-gradient-to-b from-zinc-50 to-zinc-100 px-4 py-8 dark:from-black dark:to-zinc-950">
            <div className="mx-auto max-w-5xl">{children}</div>
          </main>

          <footer className="border-t border-zinc-200 bg-white/70 px-4 py-4 text-xs text-zinc-500 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-400">
            <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
              <span>오늘의 메뉴를 빠르게 정하고, 고민 시간은 줄여요.</span>
              <span className="text-[11px]">
                Made with Next.js · Tailwind CSS · Supabase
              </span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
