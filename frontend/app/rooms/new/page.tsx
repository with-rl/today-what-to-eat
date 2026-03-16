'use client';

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface CreateRoomResponse {
  room: {
    id: string;
    title: string;
  };
}

export default function CreateRoomPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [teamId, setTeamId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage("방 제목을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const expiresAtIso =
        expiresAt && expiresAt.trim().length > 0
          ? new Date(expiresAt).toISOString()
          : null;

      const response = await fetch("/api/v1/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmedTitle,
          teamId: teamId.trim().length > 0 ? teamId.trim() : null,
          expiresAt: expiresAtIso,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        setErrorMessage(
          payload?.message ??
            "투표 방 생성에 실패했어요. 잠시 후 다시 시도해주세요.",
        );
        setIsSubmitting(false);
        return;
      }

      const data = (await response.json()) as CreateRoomResponse;
      const roomId = data.room.id;

      router.push(`/rooms/${roomId}`);
    } catch (error) {
      setErrorMessage(
        "네트워크 오류가 발생했어요. 인터넷 연결을 확인한 뒤 다시 시도해주세요.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-8 rounded-3xl bg-white/95 px-6 py-7 shadow-[0_18px_45px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 dark:bg-slate-950/95 dark:ring-slate-800">
      <header className="space-y-2 border-b border-slate-200 pb-4 dark:border-slate-800">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          오늘 점심 투표 방 만들기
        </h1>
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          방 제목과 팀 이름, 투표 마감 시간을 입력하면 팀원들과 함께 사용할 점심
          메뉴 투표 방이 생성돼요. 생성된 링크를 메신저로 공유해 보세요.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        <div className="space-y-1.5">
          <label
            htmlFor="title"
            className="block text-xs font-medium text-slate-700 dark:text-slate-200"
          >
            방 제목 <span className="text-amber-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            autoFocus
            placeholder="예: 디팀 4월 5일 점심"
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 transition-colors duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            오늘 날짜와 팀 이름을 함께 적어 두면 나중에 이력을 볼 때도 한눈에
            알아보기 쉬워요.
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="team"
            className="block text-xs font-medium text-slate-700 dark:text-slate-200"
          >
            팀 이름 또는 설명 <span className="text-slate-400">(선택)</span>
          </label>
          <input
            id="team"
            name="team"
            type="text"
            placeholder="예: 디팀, 디자인팀, 개발 1파트"
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 transition-colors duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
            value={teamId}
            onChange={(event) => setTeamId(event.target.value)}
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            팀 이름, 부서, 프로젝트 이름 등으로 자유롭게 적어 주세요. 비워 두어도
            괜찮아요.
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="expiresAt"
            className="block text-xs font-medium text-slate-700 dark:text-slate-200"
          >
            투표 마감 시간 <span className="text-slate-400">(선택)</span>
          </label>
          <input
            id="expiresAt"
            name="expiresAt"
            type="datetime-local"
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 transition-colors duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            마감 시간을 정해 두면 “언제까지 투표하면 되는지”가 분명해져요. 설정하지
            않으면 제한 없이 투표할 수 있어요.
          </p>
        </div>

        {errorMessage ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-500/60 dark:bg-rose-900/40 dark:text-rose-100">
            {errorMessage}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
            방을 만든 뒤 링크를 복사해서 슬랙/카톡에 붙여넣으면, 팀원들이 바로
            들어와 메뉴를 제안하고 투표할 수 있어요.
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950"
            onClick={() => router.back()}
          >
            돌아가기
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex cursor-pointer items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-slate-950"
          >
            {isSubmitting ? "투표 방 만드는 중..." : "투표 방 만들기"}
          </button>
        </div>
      </form>
    </div>
  );
}

