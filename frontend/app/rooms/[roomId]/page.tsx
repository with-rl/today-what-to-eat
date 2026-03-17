import { notFound } from "next/navigation";
import { getRoomDetail } from "@/lib/server/rooms";
import { formatKoShortMonthDayTime, isExpired } from "@/lib/utils/date";
import { getTotalVotes } from "./stats";
import { RoomHeader } from "./RoomHeader";
import { CandidatesPanel } from "./CandidatesPanel";
import { SuggestCandidatePanel } from "./SuggestCandidatePanel";

interface RoomDetailPageProps {
  params: {
    roomId: string;
  };
}

export default async function RoomDetailPage({
  params,
}: RoomDetailPageProps) {
  const { roomId } = params;
  const detail = await getRoomDetail(roomId);

  if (!detail) {
    notFound();
  }

  const prettyExpiresAt = formatKoShortMonthDayTime(detail.room.expiresAt);
  const isClosed =
    detail.room.status === "closed" || isExpired(detail.room.expiresAt);
  const hasCandidates = detail.candidates.length > 0;
  const totalVotes = getTotalVotes(detail.candidates);

  return (
    <div className="mx-auto max-w-4xl space-y-8 rounded-3xl bg-white/95 px-6 py-7 shadow-[0_18px_45px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 dark:bg-slate-950/95 dark:ring-slate-800">
      <RoomHeader
        roomId={roomId}
        room={detail.room}
        prettyExpiresAt={prettyExpiresAt}
        isClosed={isClosed}
        hasCandidates={hasCandidates}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr),minmax(0,1.1fr)]">
        <CandidatesPanel
          roomId={roomId}
          candidates={detail.candidates}
          myVoteCandidateId={detail.myVote?.candidateId ?? null}
          isClosed={isClosed}
          totalVotes={totalVotes}
        />
        <SuggestCandidatePanel roomId={roomId} isClosed={isClosed} />
      </div>
    </div>
  );
}

