import Link from "next/link";
import { getRecentHistory } from "@/lib/server/history";
import { formatKoYearMonthDay } from "@/lib/utils/date";
import { TeamFilterForm } from "./TeamFilterForm";

interface HistoryPageProps {
  searchParams?: Promise<{
    teamId?: string;
    limit?: string;
  }>;
}

export default async function HistoryPage(props: HistoryPageProps) {
  const resolvedSearchParams = (await props.searchParams) ?? {};
  const limitParam = resolvedSearchParams.limit;

  let limit: number | undefined;
  if (limitParam) {
    const parsed = Number.parseInt(limitParam, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      limit = Math.min(Math.max(parsed, 1), 50);
    }
  }

  const teamId = resolvedSearchParams.teamId ?? undefined;
  const items = await getRecentHistory({ teamId, limit });

  const hasTeamFilter = !!teamId && teamId.trim().length > 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-3xl bg-white/95 px-6 py-7 shadow-[0_18px_45px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 dark:bg-slate-950/95 dark:ring-slate-800">
      <header className="space-y-2 border-b border-slate-200 pb-4 dark:border-slate-800">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300">
          오늘 뭐 먹지 · 최근 메뉴 이력
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          최근에 어떤 메뉴를 자주 먹었는지 한눈에 보기
        </h1>
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          팀이 최근에 먹었던 점심 메뉴를 날짜 순으로 모아 보여줘요. 너무 자주
          먹는 메뉴가 있는지, 골고루 먹고 있는지 가볍게 체크해 보세요.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-[11px] text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:ring-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <p>
              기본적으로 가장 최근 기록부터 {limit ?? 10}개를 보여줘요. 아래 입력창에{" "}
              <span className="font-semibold">팀 이름 일부</span>를 입력하면 해당 팀의
              이력만 골라서 볼 수 있어요.
            </p>
            <TeamFilterForm />
          </div>
          {hasTeamFilter ? (
            <p className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-slate-50 shadow-sm dark:bg-slate-50 dark:text-slate-900">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              현재 팀 필터: {teamId}
            </p>
          ) : (
            <p className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              모든 팀의 이력을 함께 보고 있어요.
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-[13px] text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
            <p className="font-medium">
              아직 저장된 식사 이력이 없어요. 먼저 투표를 통해 오늘의 메뉴를
              확정해 보세요.
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              투표 결과를 확정하면 이곳에 최근 점심 메뉴 기록이 차곡차곡 쌓일
              거예요.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/40">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col items-start justify-between gap-2 px-4 py-3.5 sm:flex-row sm:items-center"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {formatKoYearMonthDay(item.decidedAt)}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {item.menuName}
                  </p>
                  {item.teamId ? (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      팀: {item.teamId}
                    </p>
                  ) : null}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  방 ID:{" "}
                  <Link
                    href={`/rooms/${item.roomId}/result`}
                    className="rounded bg-slate-900/90 px-1 py-0.5 font-mono text-[10px] text-slate-50 underline-offset-2 hover:underline dark:bg-slate-800"
                  >
                    {item.roomId}
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

