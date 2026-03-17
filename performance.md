# Performance Audit Report (frontend/app)

대상: `frontend/app/` (요청 시점에 제공된 페이지/라우트 핸들러 파일들)

## 감사 항목별 리포트

| 일련번호 | 심각도 | 파일 | 위치 | 문제 | 권고사항 |
|---|---|---|---|---|---|
| 1 | Critical | `frontend/app/api/v1/rooms/[roomId]/votes/route.ts` | L105–L146 | 투표 생성 시 DB 왕복 3회(DELETE → INSERT → SELECT 전체 votes)로, 방 참여자가 늘수록 응답 시간이 선형으로 증가(집계 \(O(n)\)). | 집계는 DB에서 aggregate로 처리(예: `group by candidate_id count(*)`)하거나 Supabase RPC(트랜잭션 포함)로 “기존 투표 upsert + 집계”를 한 번에 수행. 최소한 집계 SELECT는 필요한 컬럼 + `group by`로 축소. |
| 2 | High | `frontend/app/api/v1/rooms/[roomId]/votes/route.ts` | L105–L110 | DELETE 후 INSERT 패턴은 트래픽 시 레이스 컨디션으로 잠깐 “무투표 상태”가 생길 수 있고, 쓰기 부하도 커짐. | `votes(room_id, voter_id)`에 유니크 제약 + upsert(또는 RPC로 트랜잭션)로 단일 쓰기 경로로 단순화. |
| 3 | High | `frontend/app/api/v1/history/route.ts` | L54–L62 | GET API가 매 요청마다 `getRecentHistory`를 호출(캐싱/재검증 헤더 없음). 트래픽 증가 시 DB 부하가 바로 올라감. | 응답에 `Cache-Control`/`s-maxage`/`stale-while-revalidate` 등 캐싱 헤더 추가(요구 신선도에 맞춰). 또는 Next.js 서버측에서 revalidate 전략을 명확히(짧은 TTL) 적용. |
| 4 | High | `frontend/app/api/v1/rooms/[roomId]/route.ts` | L25–L36 | 방 상세 GET도 캐싱/재검증 전략이 보이지 않아 동일 `roomId` 반복 조회 시 매번 DB hit 가능. | 방 상태 변화 빈도에 맞춰 캐싱 헤더/재검증 적용(예: 진행 중은 짧은 TTL, 종료 후는 긴 TTL). |
| 5 | High | `frontend/app/api/v1/rooms/[roomId]/result/route.ts` | L25–L36 | 결과 GET도 캐싱 전략 부재로 동일 요청 반복 시 중복 계산/조회 가능. | 결과가 자주 바뀌지 않으면 TTL 캐싱 또는 “투표 변경 시에만 무효화” 방식(서버측 revalidate 태그/RPC 기반) 검토. |
| 6 | Medium | `frontend/app/api/v1/rooms/[roomId]/confirm/route.ts` | L50–L57, L114–L122, L126–L130 | Supabase 쿼리에서 `.select("*")` 사용(3곳). 불필요 컬럼 전송/파싱으로 응답/CPU 비용 증가. | 필요한 컬럼만 명시(`select("id, room_id, final_candidate_id, decided_at")` 등)하고, insert 후에도 필요한 필드만 반환. |
| 7 | Medium | `frontend/app/api/v1/rooms/[roomId]/candidates/route.ts` | L92–L101 | insert 후 `.select("*")`로 필요 이상 데이터 반환 가능(후보 테이블 컬럼이 늘면 비용 증가). | 생성 응답에 필요한 필드만 select. (또는 insert 반환값을 최소화하고 이후 화면은 별도 GET에서 필요한 만큼만 조회) |
| 8 | Medium | `frontend/app/api/v1/rooms/[roomId]/votes/route.ts` | L122–L130 | insert 후 `.select("*")`로 voteRow 전체 반환. 도메인에 필요한 필드보다 과다일 수 있음. | `Vote`에 필요한 컬럼만 select(예: `id, room_id, candidate_id, voter_id, created_at`). |
| 9 | Medium | `frontend/app/page.tsx` | L4–L38 | (서버 컴포넌트지만) 요청마다 `Intl.DateTimeFormat`을 여러 번 새로 생성. 트래픽이 크면 미세하게 비용이 쌓임. | 포맷터를 모듈 스코프 상수로 재사용하거나, 한 번 만든 포맷터를 공유(동일 옵션). |
| 10 | Medium | `frontend/app/history/loading.tsx` | L10–L14 | 스켈레톤에서 array index key 사용(lint disable). 실제 리스트로 바뀌는 UI에서 재정렬/교체가 생기면 불필요한 DOM churn 위험. | 로딩 스켈레톤은 현재처럼 고정 길이면 괜찮지만, 길이가 동적으로 변할 가능성이 있으면 안정적인 key(예: 미리 만든 id 배열) 사용. |

## 관찰/범위 메모

- **불필요한 리렌더링**: 이번 범위(`page.tsx`, `history/page.tsx`, API `route.ts`)는 대부분 서버 컴포넌트/라우트 핸들러라 `useEffect` 의존성/`memo` 미사용 같은 클라이언트 리렌더 이슈는 상대적으로 관찰 포인트가 적었습니다. 핵심 병목은 DB 호출/집계 방식 쪽 비중이 큽니다.
- **이미지/폰트 최적화**: 제공된 파일들 내에서는 `next/image` 사용, 폰트 로딩, layout shift 관련 코드를 확인할 수 없어 감사 범위 밖으로 분류했습니다.

