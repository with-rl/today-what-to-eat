import Link from "next/link";
import { getHomeSummary } from "@/lib/server/home";
import { isExpired } from "@/lib/utils/date";

function formatTime(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(date);
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDateTime(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(date);
}

export default async function Home() {
  const { latestRoom, latestResult, recentHistory } = await getHomeSummary();

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr),minmax(0,1.2fr)]">
      {/* Left: Hero copy + primary actions */}
      <section className="space-y-6">
        <div className="space-y-4">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl md:text-5xl dark:text-slate-50">
            점심 메뉴에 필요한{" "}
            <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
              모든 정보와 결정
            </span>
            을 한 화면에서.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
            팀원들이 먹고 싶은 메뉴를 제안하고, 1인 1표로 투표하고, 최종 결과를 공유하는
            과정을 한 번에 정리해 주는 점심 메뉴 투표 서비스입니다. 고민은 줄이고, 결정만
            빠르게 가져가세요.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* 최근 투표 카드 */}
          <div className="flex flex-col rounded-xl bg-sky-900/90 px-4 py-4 text-sky-50 shadow-md">
            <div className="mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-200">
              <span>최근 투표</span>
              {latestRoom ? (
                (() => {
                  const closed =
                    latestRoom.status === "closed" ||
                    isExpired(latestRoom.expiresAt);
                  return (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                        closed
                          ? "bg-rose-50/10 text-rose-100 ring-rose-200/50"
                          : "bg-emerald-50/10 text-emerald-100 ring-emerald-200/50"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          closed ? "bg-rose-300" : "bg-emerald-300"
                        }`}
                      />
                      {closed ? "마감됨" : "진행 중"}
                    </span>
                  );
                })()
              ) : (
                <span>대기 중</span>
              )}
            </div>
            {latestRoom ? (
              <>
                <p className="text-sm font-semibold line-clamp-2">
                  {latestRoom.title}
                </p>
                <p className="mt-1 text-xs text-sky-100/80">
                  {latestRoom.teamId ? `${latestRoom.teamId} · ` : null}
                  {formatDateTime(latestRoom.createdAt)
                    ? `${formatDateTime(latestRoom.createdAt)} 생성 · `
                    : null}
                  {latestRoom.totalParticipants}명 참여
                </p>
                <p className="mt-1 text-[11px] text-sky-100/80">
                  {latestRoom.expiresAt
                    ? `${formatTime(latestRoom.expiresAt)} 마감 · `
                    : "마감 시간 없음 · "}
                  메뉴 후보 {latestRoom.totalCandidates}개
                </p>
                <Link
                  href={`/rooms/${latestRoom.id}`}
                  className="mt-3 inline-flex w-fit cursor-pointer items-center justify-center rounded-full bg-sky-50/10 px-3 py-1.5 text-[11px] font-semibold text-sky-50 ring-1 ring-sky-300/60 transition-colors duration-200 hover:bg-sky-50/20"
                >
                  이 투표 방으로 이동
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold">
                  아직 생성된 투표 방이 없어요.
                </p>
                <p className="mt-1 text-xs text-sky-100/80">
                  오늘 첫 투표 방을 만들어서 팀 점심 메뉴를 정해볼까요?
                </p>
                <Link
                  href="/rooms/new"
                  className="mt-3 inline-flex w-fit cursor-pointer items-center justify-center rounded-full bg-sky-50 px-3 py-1.5 text-[11px] font-semibold text-sky-900 shadow-sm transition-colors duration-200 hover:bg-white"
                >
                  첫 투표 방 만들기
                </Link>
              </>
            )}
          </div>

          {/* 최근 메뉴 카드 */}
          <div className="flex flex-col justify-between rounded-xl bg-slate-900 px-4 py-4 text-slate-50 shadow-md">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                최근 메뉴
              </p>
              {latestResult ? (
                <>
                  <p className="mt-2 text-sm font-semibold">
                    {latestResult.menuName}
                  </p>
                  <p className="mt-1 text-xs text-slate-300">
                    {latestResult.votesCount}표 · 가장 많은 팀원이 선택했어요
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {latestResult.teamId ? `${latestResult.teamId} · ` : null}
                    {formatDate(latestResult.decidedAt)} 확정
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm font-semibold">
                    아직 확정된 메뉴가 없어요
                  </p>
                  <p className="mt-1 text-xs text-slate-300">
                    투표를 마치고 결과를 확정하면, 여기에서 최근 메뉴를
                    바로 확인할 수 있어요.
                  </p>
                </>
              )}
            </div>
            <p className="mt-4 text-[11px] text-slate-300">
              {latestResult
                ? "“오늘 팀 점심 메뉴는 이 카드에서 바로 확인하고, 결과 화면에서 한 줄 텍스트로 복사해 공유할 수 있어요.”"
                : "“먼저 투표 방을 만들고 투표를 진행한 뒤, 결과 화면에서 메뉴를 확정해 주세요.”"}
            </p>
          </div>

          {/* 최근 메뉴 이력 카드 */}
          <div className="flex flex-col justify-between rounded-xl bg-white px-4 py-4 text-slate-900 shadow-md ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-50 dark:ring-slate-700">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
                최근 메뉴 이력
              </p>
              <ul className="mt-3 space-y-1.5 text-xs">
                {recentHistory.length === 0 ? (
                  <li className="text-slate-500 dark:text-slate-400">
                    아직 기록된 식사 이력이 없어요.
                  </li>
                ) : (
                  recentHistory.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <span>
                        {formatDate(item.decidedAt)} · {item.menuName}
                      </span>
                      <Link
                        href={`/rooms/${item.roomId}/result`}
                        className="text-[11px] text-slate-400 underline-offset-2 hover:underline dark:text-slate-400"
                      >
                        결과 보기
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">
              메뉴 편식 없이, 골고루 먹고 있는지 한눈에 확인하세요. 자세한
              이력은 아래 버튼에서 확인할 수 있어요.
            </p>
            <Link
              href="/history"
              className="mt-2 inline-flex w-fit cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 shadow-sm transition-colors duration-200 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-50 dark:hover:bg-slate-800"
            >
              전체 이력 보러가기
            </Link>
          </div>
        </div>
      </section>

      {/* Right: Form-like CTA layout */}
      <section className="rounded-3xl bg-white/95 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 dark:bg-slate-950/95 dark:ring-slate-800">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold leading-snug text-slate-900 dark:text-slate-50">
              팀 점심 투표를 바로 시작해 보세요
            </h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              방을 하나 만들고, 링크만 공유하면 오늘 점심 메뉴가 깔끔하게 정리됩니다.
            </p>
          </div>
          <div className="hidden h-1.5 w-16 rounded-full bg-gradient-to-r from-sky-400 to-amber-400 sm:block" />
        </div>

        <div className="mt-5 grid gap-4 text-xs text-slate-700 sm:grid-cols-[minmax(0,1.1fr),minmax(0,1.2fr)] dark:text-slate-200">
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border border-sky-500 text-[10px] font-semibold text-sky-600 dark:border-sky-400 dark:text-sky-300">
                1
              </span>
              <div>
                <p className="text-xs font-semibold">투표 방을 만들어요</p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  오늘 날짜와 팀 이름으로 방을 만들고, 점심 투표를 위한 마감 시간을 정해요.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border border-sky-500 text-[10px] font-semibold text-sky-600 dark:border-sky-400 dark:text-sky-300">
                2
              </span>
              <div>
                <p className="text-xs font-semibold">메뉴를 제안하고 투표해요</p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  누구나 메뉴를 자유롭게 추가하고, 1인 1표로 가장 먹고 싶은 메뉴에 투표합니다.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border border-sky-500 text-[10px] font-semibold text-sky-600 dark:border-sky-400 dark:text-sky-300">
                3
              </span>
              <div>
                <p className="text-xs font-semibold">결과를 공유해요</p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  최다 득표 메뉴와 투표 요약을 한 줄 텍스트로 복사해서 슬랙/카톡에 바로 공유할 수
                  있어요.
                </p>
              </div>
            </li>
          </ul>

          <div className="mt-2 space-y-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-slate-700">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              오늘 점심 투표 방 정보를 입력해 볼까요?
            </p>
            <div className="grid gap-3 text-[11px] sm:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  방 제목
                </label>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50">
                  디팀 4월 5일 점심
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  팀 이름 (선택)
                </label>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50">
                  디자인팀
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  투표 마감 시간
                </label>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50">
                  오늘 · 11:50
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  예상 인원 수
                </label>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50">
                  6–10명
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                실제 방 생성은 다음 단계에서 진행돼요. 지금은 흐름만 가볍게 상상해 보세요.
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Link
                  href="/rooms/new"
                  className="inline-flex cursor-pointer items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:ring-offset-slate-900"
                >
                  지금 투표 방 만들기
                </Link>
                <Link
                  href="/history"
                  className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-50 dark:hover:bg-slate-800 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-900"
                >
                  최근 메뉴 이력 보기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
