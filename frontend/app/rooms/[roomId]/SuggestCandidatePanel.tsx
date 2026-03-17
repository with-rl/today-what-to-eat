import { AddCandidateForm } from "./AddCandidateForm";

interface SuggestCandidatePanelProps {
  roomId: string;
  isClosed: boolean;
}

export function SuggestCandidatePanel({
  roomId,
  isClosed,
}: SuggestCandidatePanelProps) {
  return (
    <section className="space-y-4 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-slate-700">
      <div className="space-y-1.5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          메뉴 제안하기
        </h2>
        <p className="text-[11px] text-slate-600 dark:text-slate-300">
          팀원들이 떠오르는 메뉴를 자유롭게 제안할 수 있는 공간이에요. 비슷한 메뉴가
          여러 개 있어도 괜찮아요. 나중에 투표로 정리하면 됩니다.
        </p>
      </div>

      <AddCandidateForm roomId={roomId} isClosed={isClosed} />
    </section>
  );
}

