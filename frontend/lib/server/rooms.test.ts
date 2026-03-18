import { describe, it, expect } from "vitest";
import type { RoomResultCandidate } from "@/lib/types/domain";
import { buildRoomResultCandidates } from "@/lib/server/rooms";

describe("투표 결과 집계 엣지 케이스", () => {
  it("투표가 하나도 없으면 모든 후보의 득표수는 0이고 winnerId는 null", () => {
    const candidateRows = [
      {
        id: "c1",
        name: "메뉴1",
        description: null,
        created_at: "2024-01-01T00:00:00.000Z",
      },
      {
        id: "c2",
        name: "메뉴2",
        description: null,
        created_at: "2024-01-02T00:00:00.000Z",
      },
    ];

    const voteRows: { candidate_id: string }[] = [];

    const { candidates, winner } = buildRoomResultCandidates(
      candidateRows,
      voteRows,
    );

    expect(candidates).toEqual([
      { candidateId: "c1", name: "메뉴1", votesCount: 0 },
      { candidateId: "c2", name: "메뉴2", votesCount: 0 },
    ]);
    expect(winner).toBeNull();
  });

  it("동률일 때 더 먼저 생성된 후보가 승자", () => {
    const candidateRows = [
      {
        id: "early",
        name: "먼저 만든 메뉴",
        description: null,
        created_at: "2024-01-01T00:00:00.000Z",
      },
      {
        id: "late",
        name: "나중에 만든 메뉴",
        description: null,
        created_at: "2024-01-02T00:00:00.000Z",
      },
    ];

    const voteRows: { candidate_id: string }[] = [
      { candidate_id: "early" },
      { candidate_id: "late" },
    ];

    const { winner } = buildRoomResultCandidates(candidateRows, voteRows);

    expect(winner?.candidateId).toBe("early");
  });

  it("후보가 한 명뿐이어도 0표면 winnerId는 null", () => {
    const candidateRows = [
      {
        id: "only",
        name: "혼자 있는 메뉴",
        description: null,
        created_at: "2024-01-01T00:00:00.000Z",
      },
    ];

    const voteRows: { candidate_id: string }[] = [];

    const { winner } = buildRoomResultCandidates(candidateRows, voteRows);

    expect(winner).toBeNull();
  });

  it("후보가 없으면 candidates는 빈 배열이고 winnerId는 null", () => {
    const candidateRows: {
      id: string;
      name: string;
      description: string | null;
      created_at: string;
    }[] = [];
    const voteRows: { candidate_id: string }[] = [];

    const { candidates, winner } = buildRoomResultCandidates(
      candidateRows,
      voteRows,
    );

    expect(candidates).toEqual([]);
    expect(winner).toBeNull();
  });

  it("여러 표가 있을 때 최다 득표 후보를 winnerId로 반환", () => {
    const candidateRows = [
      {
        id: "a",
        name: "A",
        description: null,
        created_at: "2024-01-01T00:00:00.000Z",
      },
      {
        id: "b",
        name: "B",
        description: null,
        created_at: "2024-01-02T00:00:00.000Z",
      },
    ];

    const voteRows: { candidate_id: string }[] = [
      { candidate_id: "a" },
      { candidate_id: "a" },
      { candidate_id: "b" },
    ];

    const { winner } = buildRoomResultCandidates(candidateRows, voteRows);

    expect(winner?.candidateId).toBe("a");
  });
});

