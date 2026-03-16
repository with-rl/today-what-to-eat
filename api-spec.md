## "오늘 뭐 먹지?" API 스펙 개요

이 문서는 **프론트엔드(Next.js App Router)** 와 **백엔드(API 라우트 / 서버 액션 / Supabase)** 가  
어떤 데이터를 주고받는지 정리한 문서이다.

복잡한 인증/권한은 나중에 확장한다는 가정으로,  
일단은 **“팀 단위 투표 방”을 중심으로 한 기본 흐름**만 정의한다.

---

## 공통 개념 / 타입 (개념적)

실제 구현에서는 TypeScript 인터페이스/타입으로 정의하면 된다.  
여기서는 이해를 돕기 위한 **개념적인 타입**이다.

- **Team** (선택: 초기 버전에서는 생략 가능, 나중에 도입)
  - `id`: string
  - `name`: string

- **VoteRoom (투표 방)**
  - `id`: string
  - `title`: string            // 방 제목 (예: "디팀 4월 5일 점심")
  - `teamId`: string | null    // 팀과 연결할 수 있으면 사용, 없으면 null
  - `expiresAt`: string | null // 투표 마감 시간 (ISO 문자열), 없으면 null
  - `createdAt`: string        // 생성 시각 (ISO)

- **MenuCandidate (메뉴 후보)**
  - `id`: string
  - `roomId`: string
  - `name`: string             // 메뉴 이름 (예: "초밥")
  - `description`: string | null // 간단 설명/가게 이름 (선택)

- **Vote (투표 기록)**
  - `id`: string
  - `roomId`: string
  - `candidateId`: string
  - `voterId`: string | null   // 나중에 로그인/사용자 시스템 도입 시 사용
  - `createdAt`: string

- **MealHistory (식사 이력)**
  - `id`: string
  - `roomId`: string
  - `finalCandidateId`: string // 최종 선택된 메뉴
  - `decidedAt`: string        // 결정 시각 (ISO)

---

## 1. 투표 방 생성 API

### 목적
프론트엔드에서 **새 투표 방을 만들고**, 방 정보와 초대용 ID를 받는다.

### 엔드포인트 (예시)
- `POST /api/v1/rooms`

### 요청 바디 (Request)
```json
{
  "title": "디팀 4월 5일 점심",
  "teamId": null,
  "expiresAt": "2026-03-16T11:50:00.000Z"
}
```

- `title`: 방 제목 (필수)
- `teamId`: 팀 ID (선택, 초기에 없으면 `null`)
- `expiresAt`: 투표 마감 시간 (선택, 없으면 `null`로 보낼 수 있음)

### 응답 바디 (Response)
```json
{
  "room": {
    "id": "room_123",
    "title": "디팀 4월 5일 점심",
    "teamId": null,
    "expiresAt": "2026-03-16T11:50:00.000Z",
    "createdAt": "2026-03-16T11:00:00.000Z"
  }
}
```

프론트엔드는 `room.id`를 사용해서  
`/rooms/room_123` 같은 링크를 동료에게 공유할 수 있다.

---

## 2. 메뉴 후보 추가 API

### 목적
기존 투표 방에 **팀원들이 먹고 싶은 메뉴를 제안**할 때 사용한다.

### 엔드포인트 (예시)
- `POST /api/v1/rooms/:roomId/candidates`

### 요청 바디
```json
{
  "name": "초밥",
  "description": "회사 근처 B초밥집"
}
```

- `name`: 메뉴 이름 (필수)
- `description`: 간단 설명/가게 이름 (선택)

### 응답 바디
```json
{
  "candidate": {
    "id": "cand_1",
    "roomId": "room_123",
    "name": "초밥",
    "description": "회사 근처 B초밥집"
  }
}
```

프론트엔드는 응답으로 받은 `candidate`를  
현재 화면의 후보 목록에 추가해서 바로 보여주면 된다.

---

## 3. 투표 방 상세 / 현재 상태 조회 API

### 목적
투표 방에 들어갔을 때, **방 정보 + 메뉴 후보 + 현재 득표 상황**을 한 번에 가져온다.

### 엔드포인트
- `GET /api/v1/rooms/:roomId`

### 응답 바디
```json
{
  "room": {
    "id": "room_123",
    "title": "디팀 4월 5일 점심",
    "teamId": null,
    "expiresAt": "2026-03-16T11:50:00.000Z",
    "createdAt": "2026-03-16T11:00:00.000Z"
  },
  "candidates": [
    {
      "id": "cand_1",
      "roomId": "room_123",
      "name": "초밥",
      "description": "회사 근처 B초밥집",
      "votesCount": 3
    },
    {
      "id": "cand_2",
      "roomId": "room_123",
      "name": "김치찌개",
      "description": null,
      "votesCount": 1
    }
  ],
  "myVote": {
    "candidateId": "cand_1"
  }
}
```

- `room`: 방 기본 정보
- `candidates[]`: 각 메뉴 후보 + 현재 득표 수
- `myVote`: 현재 사용자가 어디에 투표했는지 (로그인/세션이 있다면), 없으면 `null` 또는 필드 생략

프론트엔드는 이 데이터를 기반으로:
- 제목 영역,
- 후보 목록,
- 현재 득표 수,
- 내가 투표한 후보 표시  
등을 한 번에 그릴 수 있다.

---

## 4. 1인 1표 투표 API

### 목적
사용자가 메뉴 후보 하나를 선택해 **투표**할 때 사용한다.  
1인 1표라서, 같은 사용자가 다시 투표하면 **기존 투표를 바꾸는 식**으로 설계할 수 있다.

### 엔드포인트
- `POST /api/v1/rooms/:roomId/votes`

### 요청 바디
```json
{
  "candidateId": "cand_1"
}
```

### 응답 바디
```json
{
  "vote": {
    "id": "vote_999",
    "roomId": "room_123",
    "candidateId": "cand_1",
    "voterId": null,
    "createdAt": "2026-03-16T11:10:00.000Z"
  },
  "summary": {
    "candidates": [
      { "candidateId": "cand_1", "votesCount": 3 },
      { "candidateId": "cand_2", "votesCount": 1 }
    ],
    "myVote": {
      "candidateId": "cand_1"
    }
  }
}
```

프론트엔드는 `summary` 정보를 사용해서  
다시 한 번 후보별 득표 수와 **내 투표 상태**를 갱신할 수 있다.

---

## 5. 투표 결과 확정 / 최다 득표 메뉴 조회 API

투표 결과는 다음 두 가지 방식으로 다룰 수 있다.

1. **마감 시간이 지나면 서버에서 자동 계산** (페이지 진입 시마다 계산)
2. “결과 확정” 버튼을 만들어 **한 번 계산해서 저장**  

여기서는 **간단한 조회용 API**만 정의한다.

### 엔드포인트
- `GET /api/v1/rooms/:roomId/result`

### 응답 바디
```json
{
  "roomId": "room_123",
  "winner": {
    "candidateId": "cand_1",
    "name": "초밥",
    "description": "회사 근처 B초밥집",
    "votesCount": 5
  },
  "tieBreakRule": "earliest", // 동점 시 먼저 제안된 메뉴 승리
  "candidates": [
    { "candidateId": "cand_1", "name": "초밥", "votesCount": 5 },
    { "candidateId": "cand_2", "name": "김치찌개", "votesCount": 3 }
  ]
}
```

프론트엔드는 `winner` 정보를 사용해서  
“오늘의 메뉴: ○○○” 라는 결과 화면과  
공유용 텍스트를 만들 수 있다.

---

## 6. 오늘의 메뉴 이력 기록 / 조회 API

최종 결과를 **식사 이력(MealHistory)** 로 남겨두고,  
나중에 “최근 먹었던 메뉴”를 확인하는 데 사용한다.

### (선택) 결과 확정 & 이력 저장 API

- `POST /api/v1/rooms/:roomId/confirm`

```json
{
  "finalCandidateId": "cand_1"
}
```

**응답 예시**
```json
{
  "history": {
    "id": "hist_1",
    "roomId": "room_123",
    "finalCandidateId": "cand_1",
    "decidedAt": "2026-03-16T11:55:00.000Z"
  }
}
```

이 API는 나중에 필요하면 도입하고,  
처음에는 `result` 조회 시 동시에 기록해도 된다.

### 최근 메뉴 이력 조회 API

- `GET /api/v1/history?teamId=team_1&limit=10`

**응답 예시**
```json
{
  "items": [
    {
      "id": "hist_3",
      "decidedAt": "2026-03-16T11:55:00.000Z",
      "roomId": "room_123",
      "menuName": "초밥"
    },
    {
      "id": "hist_2",
      "decidedAt": "2026-03-15T11:50:00.000Z",
      "roomId": "room_100",
      "menuName": "김치찌개"
    }
  ]
}
```

프론트엔드는 이 리스트를 “최근 메뉴 이력” 화면에서 보여주면 된다.

---

## 7. 프론트엔드에서의 사용 예시 (요약)

예를 들어, Next.js App Router 기준으로:

- `POST /api/v1/rooms`  
  → 투표 방 생성 페이지에서 폼 전송 후, 응답의 `room.id`로 리다이렉트

- `GET /api/v1/rooms/:roomId`  
  → 방 상세 페이지(`app/rooms/[roomId]/page.tsx`)에서 서버 컴포넌트로 호출해  
    방 정보 + 후보 목록 + 득표 수를 한 번에 렌더링

- `POST /api/v1/rooms/:roomId/candidates`  
  → 클라이언트 컴포넌트에서 메뉴 제안 폼 제출 시 호출,  
    응답의 `candidate`를 상태에 추가해 리스트 갱신

- `POST /api/v1/rooms/:roomId/votes`  
  → 사용자가 메뉴를 클릭해 투표할 때 호출,  
    응답의 `summary`로 득표 상황 UI를 업데이트

- `GET /api/v1/rooms/:roomId/result`  
  → 결과 화면에서 “오늘의 메뉴”와 득표 현황을 보여줄 때 사용

- `GET /api/v1/history?teamId=...`  
  → “최근 메뉴 이력” 페이지에서 사용

이 스펙을 기반으로, 나중에 AI에게  
“api-spec.md 기준으로 이 엔드포인트를 Next.js `app/api/.../route.ts`로 구현해줘”  
같은 식으로 구체적인 개발 지시를 내릴 수 있다.

