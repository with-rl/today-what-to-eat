# OWASP Top 10 보안 감사 리포트 (frontend/app)

## 범위

- 대상: `frontend/app/` (Next.js App Router 라우트 핸들러 및 관련 서버 유틸 포함)
- 근거 파일(직접 확인):  
  - `frontend/app/api/v1/history/route.ts`  
  - `frontend/app/api/v1/rooms/route.ts`  
  - `frontend/app/api/v1/rooms/[roomId]/route.ts`  
  - `frontend/app/api/v1/rooms/[roomId]/result/route.ts`  
  - `frontend/app/api/v1/rooms/[roomId]/candidates/route.ts`  
  - `frontend/app/api/v1/rooms/[roomId]/votes/route.ts`  
  - `frontend/app/api/v1/rooms/[roomId]/confirm/route.ts`  
  - `frontend/lib/server/history.ts`  
  - `frontend/lib/server/rooms.ts`  
  - `frontend/lib/supabase/server.ts`  
  - `frontend/lib/utils/uuid.ts`

## 감사 항목

- SQL 인젝션 가능성 (parameterized query 미사용 여부)
- 세션 관리 안전성 (토큰 만료, 재사용 공격)
- 에러 메시지 정보 유출 (스택 트레이스, DB 정보 노출)
- Bcrypt 사용 규칙 (saltRounds 최소 12 이상, 평문 비교 금지)

## 발견 사항

| 일련번호 | 심각도 | 파일 | 위치 | 문제 | 권고사항 |
|---|---|---|---|---|---|
| 1 | High | `frontend/app/api/v1/rooms/[roomId]/votes/route.ts` | L54-L67, L105-L110 | **세션/식별자(`voter_id`)를 서버 발급 “인증 토큰”처럼 사용**하지만, 서명/무결성 검증이 없어 **쿠키 탈취·재사용 공격**에 취약합니다. 또한 `voter_id`가 단순 식별자라 로그아웃/폐기(서버측 revoke) 개념이 없습니다. | **서명된 세션 토큰(JWT with rotation) 또는 Supabase Auth 세션**으로 전환하고, 최소한 `voter_id`를 **서명된 값(예: HMAC)**으로 만들어 위변조를 탐지하세요. 서버측에 **세션 테이블 + 만료/폐기 + 재사용 탐지(rotate+revoke)**를 두는 것을 권장합니다. |
| 2 | Medium | `frontend/app/api/v1/rooms/[roomId]/votes/route.ts` | L58-L67 | `voter_id` 생성은 기본적으로 `crypto.randomUUID()`를 사용하나, **해당 API가 `crypto.randomUUID()`를 제공하지 않는 런타임에서 실행될 경우** `Date.now()+Math.random()` 기반 폴백으로 내려갑니다. 이 폴백은 **예측 가능/충돌 가능성이 상대적으로 높아** 식별자 추측·세션 고정(쿠키 주입) 리스크를 키울 수 있습니다. | 폴백을 제거하고 서버에서 항상 **CSPRNG 기반 식별자 생성만 허용**하세요(예: `crypto.randomUUID()` 강제). 불가피하면 `crypto.getRandomValues` 기반으로 구현하고, **서명/만료/회전**(1번 권고)과 함께 운영하세요. |
| 3 | Medium | `frontend/lib/server/rooms.ts` | L115-L117, L162-L165, L188-L193 | `getRoomDetail()`이 `voter_id`를 읽어 “내 투표”를 계산하지만, 이 식별자는 **사용자 인증이 아니라 단순 쿠키**라서 탈취 시 동일한 “내 투표”로 보이게 됩니다(프라이버시/세션 고정). | 위 1번과 같이 **정식 세션**으로 전환하거나, 최소한 `voter_id`를 **기기/브라우저 바인딩(서명 + user-agent 일부 + 발급 시각)** 등으로 강화하고, **짧은 TTL + 재발급**을 적용하세요. |
| 4 | Medium | `frontend/app/api/v1/rooms/[roomId]/votes/route.ts` | L61-L67 | 쿠키 속성은 `httpOnly`, `secure(Prod)`, `sameSite=lax`는 설정되어 있으나, **세션 만료/회전(rotate)** 정책이 30일 고정이고, **재사용 탐지**가 없습니다. | 고위험 액션(투표 등)에 대해 **짧은 TTL(예: 1~7일) + 회전 + 서버측 revoke 리스트**를 권장합니다. 또한 `SameSite=Strict` 적용 가능성 검토(UX 영향 고려) 및 민감도에 따라 `__Host-` prefix 등도 고려하세요. |
| 5 | Medium | `frontend/lib/supabase/server.ts` | L3-L20 | 서버에서 Supabase 클라이언트를 **Anon Key**로 생성하고 `persistSession:false`만 둡니다. 이 자체는 “세션을 서버에 저장하지 않음”이지만, 결과적으로 현재 API들은 **사용자 인증/권한 부여를 거의 하지 않는 구조**(누구나 호출 가능)로 보입니다. | “익명 투표 앱” 의도라면 괜찮지만, 팀/방/이력에 접근제어가 필요하다면 **Supabase Auth(JWT) 연동 + RLS 정책**을 활성화하고, API에서 **Authorization 검증**을 추가하세요. |
| 6 | Medium | `frontend/lib/server/history.ts` | L16-L18, L30-L39 | 팀 필터에서 `.ilike("vote_rooms.team_id", \`%${keyword}%\`)`를 사용합니다. `escapeLikePattern()`로 `%/_/\\`를 이스케이프하지만, **Supabase의 `ilike`가 이 이스케이프를 “escape 문자”로 해석하는지 보장되지 않으면**(백엔드 구현/드라이버에 따라) **필터 우회/과다 조회(DoS성)**가 될 수 있습니다. (전통적 SQLi라기보다 “LIKE 패턴 인젝션/검색 확장” 리스크) | 가능하면 **완전 일치(eq)** 또는 **prefix 검색** 등으로 요구사항을 좁히고, 와일드카드 검색이 필요하면 **서버측 RPC로 parameterized 처리**하거나, Supabase/PostgREST에서 **escape 지정이 가능한 방식**을 사용하세요. (현 구현은 “SQL 문자열 인젝션”은 아니지만 방어 가정이 불명확합니다.) |
| 7 | Medium | `frontend/app/api/v1/history/route.ts` | L39-L41, L54-L57 | 주석에 “LIKE escape/쿼리 안전 처리는 lib/server/history.ts에서 계속 수행”이라 되어 있는데, 실제로는 `.ilike(... %keyword%)`에 의존합니다. 입력 검증은 있으나, **teamId가 접근제어 키로 쓰일 경우**(멀티 테넌시) **권한검사 부재**로 정보노출 가능성이 있습니다. | `teamId`가 권한 경계라면 **인증된 사용자/팀 멤버십 검증 + RLS**로 강제하세요. 단순 검색 키라면 괜찮지만, 데이터 민감도를 재평가하세요. |
| 8 | Medium | `frontend/app/api/v1/rooms/route.ts` | L19-L34, L58-L67 | DB 삽입은 builder 기반이라 SQLi는 낮지만, **입력값 제한(길이/허용문자) 부족**으로 비정상적으로 긴 `title` 등이 들어가면 로그/DB/UX에 영향(자원고갈, 저장형 XSS는 프론트 렌더링 방식에 따라) 가능성이 있습니다. | `title` 길이 제한(예: 1~100), 허용문자 정책, 서버측 정규화(트리밍 외) 및 DB 제약조건을 추가하세요. |
| 9 | Medium | `frontend/app/api/v1/rooms/[roomId]/confirm/route.ts` | L33-L45 | `finalCandidateId`에 대해 **UUID 형식 검증이 없습니다**(`roomId`는 검증). Supabase builder라 SQLi는 낮지만, 잘못된 타입/형식이 DB 에러 유발 → 에러율 증가/관측 가능(간접 정보노출)합니다. | `finalCandidateId`에도 `isUuid()` 검증을 추가하고, 400으로 조기 차단하세요. |
| 10 | Medium | `frontend/lib/supabase/server.ts` | L6-L9 | 환경변수 누락 시 `throw new Error("Missing Supabase env vars...")`로 서버가 **구체적 설정 키 이름을 포함한 에러**를 던집니다. 프로덕션에서 예외가 상위로 노출되면 설정정보가 힌트가 될 수 있습니다. | 런타임에서 외부로는 **일반화된 메시지**만 반환하고, 상세는 내부 로깅으로 제한하세요. (현재 API 라우트는 대부분 catch에서 일반 메시지로 감싸고 있음) |
| 11 | Medium | `frontend/lib/server/history.ts`, `frontend/lib/server/rooms.ts` | (여러 지점) | 내부 라이브러리에서 Supabase 에러를 그대로 `throw`합니다. 라우트 핸들러에서 이를 **그대로 응답으로 노출**하진 않지만, 향후 로깅/에러 처리 변경 시 **DB/테이블/쿼리 힌트 노출** 위험이 커집니다. | 에러는 **표준화된 도메인 에러로 래핑**하고(코드/카테고리만), 외부 응답엔 일반 메시지, 내부 로그엔 제한된 컨텍스트만 남기세요. |
| 12 | Medium | `frontend/app/api/v1/*` | 전반 | **인증/인가(Authorization) 계층이 부재**합니다. “방 ID만 알면” 후보 추가/투표/확정이 가능한 구조로 읽힙니다(설계 의도에 따라 High/Critical까지도 가능). OWASP Top 10의 Broken Access Control 관점에서 큰 구조적 리스크일 수 있습니다. | 최소한 “방 소유자/팀 멤버” 개념이 있다면 **AuthN/AuthZ + RLS**를 적용하고, 라우트에서 **권한 체크**를 수행하세요. 익명 서비스라면 남용 방지(레이트리밋/캡차/서명 토큰)를 추가하세요. |
| 13 | Medium | `frontend/app/api/v1/*` | catch 블록들(여러 파일) | 외부로 스택/DB정보를 직접 반환하지는 않습니다(장점). 다만 대부분 catch에서 `error`를 **사용하지 않아서**(로깅 부재) 침해사고/오류 분석이 어려워질 수 있고, 반대로 다른 레이어에서 디폴트 에러 페이지가 노출되면 정보 유출이 될 수 있습니다(구성 의존). | 외부 응답은 유지하되, 서버측에는 **구조화 로깅(요청 ID, 코드 경로, Supabase error code 등)**을 남기고, 프로덕션에서 스택트레이스 노출이 없도록 전역 에러 핸들링을 점검하세요. |
| 14 | Medium | `frontend/app/` | 전체 | **Bcrypt 규칙 점검 불가(사용 흔적 없음)**: `frontend/app/` 범위에서는 `bcrypt`/`hash`/`compare` 사용이 확인되지 않아 saltRounds/평문 비교 여부를 검증할 코드가 없습니다. | 비밀번호를 다루는 위치(예: `frontend/lib/server/auth*`, Supabase Edge Functions, 별도 백엔드 등)를 범위에 포함하면 재감사 가능합니다. 최소 기준은 **bcrypt saltRounds ≥ 12**, **평문 저장/로그 금지**, **안전한 비교(타이밍 안전)**입니다. |

## 항목별 결론(요약)

- **SQL 인젝션**: 직접 SQL 문자열 생성은 확인되지 않았고 Supabase query builder 사용으로 전통적 SQLi 가능성은 낮음. 다만 `ilike %keyword%`는 “LIKE 패턴 확장/우회” 성격의 입력 리스크가 있어 방어 가정이 불명확.
- **세션 관리**: `voter_id` 쿠키 기반 식별이 핵심 리스크(무결성/만료/회전/재사용 탐지/폐기 부재).
- **에러 메시지 정보 유출**: 응답 메시지는 대체로 일반화되어 있으나, 라이브러리에서 raw 에러 throw 및 env-var 누락 메시지 등 “잠재적” 노출 지점 존재.
- **Bcrypt**: `frontend/app/` 범위에서 사용 흔적이 없어 평가 불가.

