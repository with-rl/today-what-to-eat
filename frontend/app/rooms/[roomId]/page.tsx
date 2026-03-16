import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoomDetail } from "@/lib/server/rooms";
import type { CandidateWithVotes } from "@/lib/types/domain";
import { CandidatesSection } from "./CandidatesSection";
import { AddCandidateForm } from "./AddCandidateForm";

interface RoomDetailPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

function formatDateTime(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getTotalVotes(candidates: CandidateWithVotes[]): number {
  return candidates.reduce((sum, candidate) => sum + candidate.votesCount, 0);
}

export default async function RoomDetailPage({
  params,
}: RoomDetailPageProps) {
  const { roomId } = await params;
  const detail = await getRoomDetail(roomId);

  if (!detail) {
    notFound();
  }

  const prettyExpiresAt = formatDateTime(detail.room.expiresAt);
  const hasCandidates = detail.candidates.length > 0;
  const totalVotes = getTotalVotes(detail.candidates);

  return (
    <div className="mx-auto max-w-4xl space-y-8 rounded-3xl bg-white/95 px-6 py-7 shadow-[0_18px_45px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 dark:bg-slate-950/95 dark:ring-slate-800">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600 dark:text-sky-300">
            오늘 뭐 먹지 · 투표 방
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            {detail.room.title}
          </h1>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 dark:text-slate-300">
            {detail.room.teamId ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {detail.room.teamId}
              </span>
            ) : null}
            {prettyExpiresAt ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {prettyExpiresAt} 마감
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                마감 시간 없음 · 자유 투표
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              {hasCandidates
                ? `현재 메뉴 후보 ${detail.candidates.length}개`
                : "아직 등록된 메뉴 후보가 없어요"}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 text-[11px] text-slate-600 sm:flex-col sm:items-end dark:text-slate-300">
          <div className="rounded-xl bg-slate-900 px-3 py-2 text-right text-slate-50 shadow-sm dark:bg-slate-900/90">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              공유 링크
            </p>
            <p className="mt-1 font-mono text-[11px] text-slate-100">
              /rooms/{roomId}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Link
              href={`/rooms/${roomId}/result`}
              className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-3.5 py-1.5 text-[11px] font-medium text-slate-50 shadow-sm transition-colors duration-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:ring-slate-300 dark:focus-visible:ring-offset-slate-950"
            >
              투표 결과 보기
            </Link>
            <Link
              href="/"
              className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
            >
              다른 방 만들기
            </Link>
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr),minmax(0,1.1fr)]">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              메뉴 후보 및 현재 득표 상황
            </h2>
            {hasCandidates && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                현재 총 <span className="font-semibold">{totalVotes}</span>표가
                모였어요.
              </p>
            )}
          </div>

          <CandidatesSection
            roomId={roomId}
            initialCandidates={detail.candidates}
            initialMyVoteCandidateId={detail.myVote?.candidateId ?? null}
          />
        </section>

        <section className="space-y-4 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-slate-700">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              메뉴 제안하기
            </h2>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              팀원들이 떠오르는 메뉴를 자유롭게 제안할 수 있는 공간이에요.
              비슷한 메뉴가 여러 개 있어도 괜찮아요. 나중에 투표로 정리하면
              됩니다.
            </p>
          </div>

          <AddCandidateForm roomId={roomId} />
        </section>
      </div>
    </div>
  );
}

