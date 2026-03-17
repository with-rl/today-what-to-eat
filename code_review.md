# Code Review Report (frontend/app)

대상: `frontend/app/` (페이지/클라이언트 컴포넌트/API Route Handler)

## 점검 리포트

| 일련번호 | 우선순위 | 파일 | 위치 | 문제 | 권고사항 |
|---|---|---|---|---|---|
| 1 | High | `frontend/app/page.tsx` / `frontend/app/rooms/[roomId]/page.tsx` / `frontend/app/rooms/[roomId]/result/page.tsx` | `page.tsx` L40–L45, `rooms/[roomId]/page.tsx` L32–L37, `rooms/[roomId]/result/page.tsx` L26–L31 | **코드 중복**: `isExpired`가 3곳에 동일 구현으로 산재. | `lib/utils/date.ts` 같은 공용 유틸로 추출해 단일 소스로 관리. |
| 2 | High | `frontend/app/rooms/[roomId]/page.tsx` / `frontend/app/rooms/[roomId]/result/page.tsx` / `frontend/app/page.tsx` | `rooms/[roomId]/page.tsx` L14–L26, `rooms/[roomId]/result/page.tsx` L12–L24, `page.tsx` L26–L38 등 | **코드 중복**: `formatDateTime`/`formatDate`/`formatTime` 형태의 날짜 포맷 로직이 페이지별로 분기/옵션만 조금 달라 중복. | “표준 포맷(홈/방/결과/이력)”을 정해 공용 formatter(옵션 인자)로 통합. |
| 3 | High | `frontend/app/rooms/[roomId]/result/page.tsx` | (파일 전체, 약 240줄) | **함수·컴포넌트 크기 / SRP 위반**: 데이터 로드(2개), 상태 파생(집계/최대값), UI 렌더가 한 파일에 과밀. | `ResultHeader`, `WinnerCard`, `CandidatesBreakdown` 등 UI 컴포넌트로 분리 + 집계는 작은 pure helper로 추출. |
| 4 | High | `frontend/app/rooms/[roomId]/page.tsx` | (파일 전체, 약 170줄) | **함수·컴포넌트 크기 / SRP 위반**: 상세 로드 + 마감 판정 + 여러 섹션 UI가 한 페이지에 결합. | 헤더/요약/섹션을 컴포넌트로 분리하고, 파생값(`isClosed`, `totalVotes`) 계산을 helper로 이동. |
| 5 | Medium | `frontend/app/rooms/new/page.tsx` / `frontend/app/rooms/[roomId]/AddCandidateForm.tsx` / `frontend/app/rooms/[roomId]/CandidatesSection.tsx` | `rooms/new/page.tsx` L39–L61, `AddCandidateForm.tsx` L42–L65, `CandidatesSection.tsx` L100–L118 | **코드 중복**: “`fetch` → `!ok`면 `response.json().catch`로 message 파싱 → 기본 에러 메시지” 패턴이 3곳 반복. | `lib/utils/http.ts`에 `fetchJson`/`getErrorMessage` 같은 공용 헬퍼로 통일(에러 타입 포함). |
| 6 | Medium | `frontend/app/api/v1/rooms/route.ts` / `frontend/app/rooms/new/page.tsx` | API: L37–L54 vs Client: L34–L38 | **중복 + 일관성 리스크**: 마감 시간 ISO 변환이 클라/서버에서 서로 다른 규칙. 서버는 `datetime-local`을 KST로 해석하려 하고, 클라는 `new Date(expiresAt).toISOString()`로 브라우저/환경 의존. | 변환 책임을 한 곳(권장: 서버)으로 몰고, 클라는 raw 값을 보내거나 “명확한 규격(UTC ISO)”만 보내도록 계약을 고정. |
| 7 | Medium | `frontend/app/history/page.tsx` / `frontend/app/rooms/[roomId]/page.tsx` / `frontend/app/rooms/[roomId]/result/page.tsx` 등 | `history/page.tsx` L6–L10, `rooms/[roomId]/*` L7–L11 | **타입 정의/컨벤션**: `params`/`searchParams`를 `Promise<...>`로 선언하고 `await`하는 패턴은 App Router 일반 관례와 달라 팀 내 혼선을 유발할 수 있음. | Next.js 권장 시그니처로 정리(일관된 `params: {}` / `searchParams: {}` 형태)하거나, 프로젝트 표준을 문서화. |
| 8 | Medium | `frontend/app/api/v1/rooms/[roomId]/*/route.ts` 전반 | 예: `confirm/route.ts` L34, `votes/route.ts` L43, `candidates/route.ts` L42 | **느슨한 타입**: `(await request.json()) as Xxx` 캐스팅이 반복되어 런타임 입력이 타입을 “통과”하기 쉬움. | 공용 런타임 스키마 검증(zod 등) 또는 최소한 타입가드/검증 유틸을 만들어 요청 바디 파싱을 표준화. |
| 9 | Low | `frontend/app/history/loading.tsx` / `frontend/app/rooms/[roomId]/loading.tsx` / `frontend/app/rooms/[roomId]/result/loading.tsx` | `history/loading.tsx` L10–L14 등 | **코드 중복(운영 관점)**: skeleton에서 `react/no-array-index-key`를 파일마다 끄는 형태가 반복. | skeleton 전용 공용 컴포넌트/헬퍼로 묶거나, 고정 길이면 “명시적 key 배열”로 disable을 줄이기. |
| 10 | Low | `frontend/app/rooms/[roomId]/CandidatesSection.tsx` | L36–L69 | **의존성/구조**: `useEffect([])`에서 `window` 이벤트를 직접 구독 + `CustomEvent` 캐스팅(타입 단언)으로 통신. 규모가 커지면 이벤트명/페이로드가 분산될 수 있음. | 이벤트를 계속 쓸 거면 `lib/events/*`로 이벤트명/타입을 중앙화. 아니면 `onCreated` 콜백을 상위에서 내려 props로 연결(표준 React 흐름). |
| 11 | Low | `frontend/app/rooms/[roomId]/result/CopyShareButton.tsx` | L54–L56 | **네이밍/가독성**: `catch (error)`에서 `error` 미사용(다른 파일도 유사). | `catch {}`로 통일하거나, 로깅/리포팅 정책이 있다면 공용 로거로 전달. |
| 12 | Low | `frontend/app/layout.tsx` | L21–L25 | **타입/네이밍 관례**: `Readonly<{ children: React.ReactNode }>`는 OK지만 프로젝트 전반에서 `PropsWithChildren` 등과 혼용될 가능성. | 팀 컨벤션으로 “레이아웃/페이지 props 타입 표준”을 하나로 통일. |

## 메모

- **any 사용**: `frontend/app/` 범위에서는 `any` 직접 사용은 발견되지 않았습니다.
- **불필요한 import / props drilling**: 이 범위에서 “안 쓰는 import”는 정적 분석(린트/TS) 없이 확정하기 어려워 보수적으로 제외했습니다. props drilling은 깊지 않은 편이며, 대신 이벤트 기반 통신이 일부 존재합니다(10번).

