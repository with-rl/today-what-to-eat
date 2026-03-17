import { notFound } from "next/navigation";
import { getRoomResult, getRoomDetail } from "@/lib/server/rooms";
import { formatKoShortMonthDayTime, isExpired } from "@/lib/utils/date";
import { getMaxVotes, getTotalVotes } from "./stats";
import { ResultHeader } from "./ResultHeader";
import { WinnerCard } from "./WinnerCard";
import { CandidateBreakdown } from "./CandidateBreakdown";

interface RoomResultPageProps {
  params: Promise<{
    roomId: string;
  }>;
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

  const prettyExpiresAt = formatKoShortMonthDayTime(detail.room.expiresAt);
  const isClosed =
    detail.room.status === "closed" || isExpired(detail.room.expiresAt);
  const decidedAt = formatKoShortMonthDayTime(result.decidedAt);
  const totalVotes = getTotalVotes(result.candidates);
  const maxVotes = getMaxVotes(result.candidates);

  return (
    <div className="mx-auto max-w-4xl space-y-8 rounded-3xl bg-white/95 px-6 py-7 shadow-[0_18px_45px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 dark:bg-slate-950/95 dark:ring-slate-800">
      <ResultHeader
        roomId={roomId}
        room={detail.room}
        prettyExpiresAt={prettyExpiresAt}
        isClosed={isClosed}
        totalVotes={totalVotes}
        winnerName={result.winner?.name ?? "미정"}
      />

      <section className="space-y-6">
        <WinnerCard winner={result.winner} isClosed={isClosed} decidedAt={decidedAt} />
        <CandidateBreakdown
          candidates={result.candidates}
          winner={result.winner}
          maxVotes={maxVotes}
        />
      </section>
    </div>
  );
}

