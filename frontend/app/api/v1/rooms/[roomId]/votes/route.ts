import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Vote, VoteSummary, VoteSummaryCandidate } from "@/lib/types/domain";
import { isUuid } from "@/lib/utils/uuid";
import { isExpired } from "@/lib/utils/date";

interface CreateVoteRequestBody {
  candidateId?: string;
}

interface CreateVoteResponseBody {
  vote: Vote;
  summary: VoteSummary;
}

interface RoomParams {
  params: Promise<{
    roomId: string;
  }>;
}

export async function POST(
  request: Request,
  { params }: RoomParams,
): Promise<NextResponse<CreateVoteResponseBody | { message: string }>> {
  const { roomId } = await params;

  if (!isUuid(roomId)) {
    return NextResponse.json(
      { message: "유효한 방 ID가 필요합니다." },
      { status: 400 },
    );
  }

  try {
    const body = (await request.json()) as CreateVoteRequestBody;
    const rawCandidateId =
      typeof body.candidateId === "string" ? body.candidateId.trim() : "";

    if (!rawCandidateId) {
      return NextResponse.json(
        { message: "투표할 메뉴 후보 ID가 필요합니다." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    let voterId = cookieStore.get("voter_id")?.value ?? null;

    if (!voterId) {
      voterId = globalThis.crypto?.randomUUID
        ? globalThis.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      cookieStore.set("voter_id", voterId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    const supabase = getSupabaseServerClient();

    const { data: roomRow, error: roomError } = await supabase
      .from("vote_rooms")
      .select("expires_at, status")
      .eq("id", roomId)
      .maybeSingle();

    if (roomError) {
      return NextResponse.json(
        {
          message:
            "투표 방 상태를 확인하는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
        },
        { status: 500 },
      );
    }

    if (!roomRow) {
      return NextResponse.json(
        { message: "해당 투표 방을 찾을 수 없어요." },
        { status: 404 },
      );
    }

    if (
      roomRow.status === "closed" ||
      isExpired((roomRow.expires_at as string | null) ?? null)
    ) {
      return NextResponse.json(
        { message: "이미 마감된 투표 방이라 투표할 수 없어요." },
        { status: 409 },
      );
    }

    // 1인 1표: 기존 투표를 삭제한 뒤 새 투표를 삽입하는 방식으로 구현
    const { error: deleteError } = await supabase
      .from("votes")
      .delete()
      .eq("room_id", roomId)
      .eq("voter_id", voterId);

    if (deleteError) {
      return NextResponse.json(
        {
          message:
            "기존 투표를 정리하는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
        },
        { status: 500 },
      );
    }

    const { data: voteRow, error: insertError } = await supabase
      .from("votes")
      .insert({
        room_id: roomId,
        candidate_id: rawCandidateId,
        voter_id: voterId,
      })
      .select("*")
      .single();

    if (insertError || !voteRow) {
      return NextResponse.json(
        {
          message:
            "투표를 저장하는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
        },
        { status: 500 },
      );
    }

    const { data: voteRows, error: votesError } = await supabase
      .from("votes")
      .select("candidate_id, voter_id")
      .eq("room_id", roomId);

    if (votesError || !voteRows) {
      return NextResponse.json(
        {
          message:
            "투표 집계를 불러오는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
        },
        { status: 500 },
      );
    }

    const voteCountByCandidateId = new Map<string, number>();
    let myCandidateId: string | null = null;

    for (const vote of voteRows) {
      const key = vote.candidate_id as string;
      voteCountByCandidateId.set(
        key,
        (voteCountByCandidateId.get(key) ?? 0) + 1,
      );

      if (voterId && vote.voter_id === voterId) {
        myCandidateId = key;
      }
    }

    const summaryCandidates: VoteSummaryCandidate[] = Array.from(
      voteCountByCandidateId.entries(),
    ).map(([candidateId, votesCount]) => ({
      candidateId,
      votesCount,
    }));

    const summary: VoteSummary = {
      candidates: summaryCandidates,
      myVote: myCandidateId
        ? {
            candidateId: myCandidateId,
          }
        : null,
    };

    const vote: Vote = {
      id: voteRow.id,
      roomId: voteRow.room_id,
      candidateId: voteRow.candidate_id,
      voterId: voteRow.voter_id,
      createdAt: voteRow.created_at,
    };

    return NextResponse.json<CreateVoteResponseBody>(
      {
        vote,
        summary,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        message:
          "요청을 처리하는 동안 알 수 없는 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
      },
      { status: 500 },
    );
  }
}

