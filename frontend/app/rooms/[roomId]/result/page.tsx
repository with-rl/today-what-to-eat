import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoomResult, getRoomDetail } from "@/lib/server/rooms";
import { CopyShareButton } from "./CopyShareButton";

interface RoomResultPageProps {
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
    timeZone: "Asia/Seoul",
  }).format(date);
}

function isExpired(expiresAt: string | null, now = new Date()): boolean {
  if (!expiresAt) return false;
  const expires = new Date(expiresAt);
  if (Number.isNaN(expires.getTime())) return false;
  return expires.getTime() <= now.getTime();
}

export default async function RoomResultPage({
  params,
}: RoomResultPageProps) {
  const { roomId } = await params;
  const [detail, result] = await Promise.all([
    getRoomDetail(roomId),
    getRoomResult(roomId),
  ]);

  if (!detail || !result) {
    notFound();
  }

  const prettyExpiresAt = formatDateTime(detail.room.expiresAt);
  const isClosed =
    detail.room.status === "closed" || isExpired(detail.room.expiresAt);
  const decidedAt = formatDateTime(result.decidedAt);
  const totalVotes = result.candidates.reduce(
    (sum, candidate) => sum + candidate.votesCount,
    0,
  );

  const maxVotes = result.candidates.reduce(
    (max, candidate) => Math.max(max, candidate.votesCount),
    0,
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8 rounded-3xl bg-white/95 px-6 py-7 shadow-[0_18px_45px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 dark:bg-slate-950/95 dark:ring-slate-800">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300">
            오늘 뭐 먹지 · 투표 결과
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
                {prettyExpiresAt} 마감 기준
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                현재 시점 기준 집계
              </span>
            )}
            {isClosed ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/25 dark:text-rose-200 dark:ring-rose-700/60">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                마감된 투표
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/25 dark:text-emerald-200 dark:ring-emerald-700/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                투표 진행 중
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              총 {totalVotes}표 집계
            </span>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-3 text-[11px] text-slate-600 sm:items-end dark:text-slate-300">
          <CopyShareButton
            roomTitle={detail.room.title}
            menuName={result.winner?.name ?? "미정"}
            teamLabel={detail.room.teamId}
          />
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Link
              href={`/rooms/${roomId}`}
              className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
            >
              투표 방으로 돌아가기
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

      <section className="space-y-6">
        <div className="rounded-2xl bg-emerald-50 px-5 py-4 ring-1 ring-emerald-100 dark:bg-emerald-900/20 dark:ring-emerald-700/60">
          {result.winner ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
                  {isClosed ? "최종 선택된 메뉴" : "현재 1등 메뉴"}
                </p>
                <p className="mt-1 text-lg font-semibold tracking-tight text-emerald-900 dark:text-emerald-50">
                  {result.winner.name}
                </p>
                {result.winner.description ? (
                  <p className="mt-1 text-xs text-emerald-800/80 dark:text-emerald-100/80">
                    {result.winner.description}
                  </p>
                ) : null}
                {isClosed && decidedAt ? (
                  <p className="mt-2 text-[11px] text-emerald-800/70 dark:text-emerald-100/70">
                    {decidedAt} 확정
                  </p>
                ) : null}
              </div>
              <div className="mt-2 flex items-center gap-2 sm:mt-0">
                <span className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-emerald-50 shadow-sm">
                  {result.winner.votesCount}표
                </span>
                <span className="hidden text-[11px] text-emerald-800/80 sm:inline dark:text-emerald-100/80">
                  동점일 경우 먼저 제안된 메뉴가 선택돼요.
                </span>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
                {isClosed ? "최종 메뉴를 결정할 수 없어요" : "아직 1등 메뉴가 없어요"}
              </p>
              <p className="mt-1 text-xs text-emerald-800/80 dark:text-emerald-100/80">
                {isClosed
                  ? "투표가 없거나 모든 메뉴의 득표수가 0표라서 최종 메뉴를 결정할 수 없어요."
                  : "투표가 없거나 모든 메뉴의 득표수가 0표라서 현재 1등을 결정할 수 없어요. 조금 더 투표가 모이면 다시 확인해 주세요."}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              후보별 득표 현황
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              막대 길이는 각 메뉴의 상대적인 득표수를 나타내요.
            </p>
          </div>

          {result.candidates.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-4 py-3 text-[11px] text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:ring-slate-700">
              아직 등록된 메뉴 후보가 없어요. 먼저 투표 방에서 메뉴를
              제안해보세요.
            </p>
          ) : (
            <ul className="space-y-2">
              {result.candidates.map((candidate) => {
                const isWinner =
                  !!result.winner &&
                  candidate.candidateId === result.winner.candidateId;
                const ratio =
                  maxVotes > 0 ? candidate.votesCount / maxVotes : 0;
                const widthPercent = `${Math.max(ratio * 100, 8)}%`;

                return (
                  <li
                    key={candidate.candidateId}
                    className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-slate-700"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {isWinner ? (
                          <span className="inline-flex h-5 items-center rounded-full bg-emerald-100 px-2 text-[10px] font-semibold text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-100 dark:ring-emerald-700/70">
                            오늘의 메뉴
                          </span>
                        ) : null}
                        <span className="text-xs font-medium text-slate-900 dark:text-slate-50">
                          {candidate.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
                        {candidate.votesCount}표
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isWinner
                            ? "bg-emerald-500"
                            : "bg-slate-400 dark:bg-slate-500"
                        }`}
                        style={{ width: widthPercent }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

