-- Supabase schema for "오늘 뭐 먹지?"
-- Run this in Supabase SQL editor to create the core tables.

-- 1) VoteRoom: vote_rooms
create table if not exists public.vote_rooms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  team_id text null,
  expires_at timestamptz null,
  status text not null default 'open',
  closed_at timestamptz null,
  created_at timestamptz not null default now()
);

comment on table public.vote_rooms is '투표 방 (VoteRoom)';
comment on column public.vote_rooms.id is '투표 방 ID';
comment on column public.vote_rooms.team_id is '팀 ID (선택, 문자열로 보관)';
comment on column public.vote_rooms.expires_at is '투표 마감 시간';
comment on column public.vote_rooms.status is '투표 방 상태 (open/closed)';
comment on column public.vote_rooms.closed_at is '종료 처리된 시각 (선택)';
comment on column public.vote_rooms.created_at is '생성 시각';

alter table public.vote_rooms
  add constraint vote_rooms_status_check
  check (status in ('open', 'closed'));

-- 2) MenuCandidate: menu_candidates
create table if not exists public.menu_candidates (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.vote_rooms(id) on delete cascade,
  name text not null,
  description text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_menu_candidates_room_id
  on public.menu_candidates (room_id);

comment on table public.menu_candidates is '메뉴 후보 (MenuCandidate)';
comment on column public.menu_candidates.room_id is '속한 투표 방 ID';
comment on column public.menu_candidates.name is '메뉴 이름';
comment on column public.menu_candidates.description is '간단 설명/가게 이름';
comment on column public.menu_candidates.created_at is '후보 추가 시각';

-- 3) Vote: votes
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.vote_rooms(id) on delete cascade,
  candidate_id uuid not null references public.menu_candidates(id) on delete cascade,
  voter_id text null,
  created_at timestamptz not null default now()
);

-- 1인 1표: 같은 room + voter_id 조합은 하나만 허용 (voter_id가 있을 때만)
create unique index if not exists uq_votes_room_voter
  on public.votes (room_id, voter_id)
  where voter_id is not null;

create index if not exists idx_votes_candidate_id
  on public.votes (candidate_id);

comment on table public.votes is '투표 기록 (Vote)';
comment on column public.votes.room_id is '투표 방 ID';
comment on column public.votes.candidate_id is '투표한 메뉴 후보 ID';
comment on column public.votes.voter_id is '투표자 식별용 문자열 (선택)';
comment on column public.votes.created_at is '투표 시각';

-- 4) MealHistory: meal_history
create table if not exists public.meal_history (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.vote_rooms(id) on delete restrict,
  final_candidate_id uuid not null references public.menu_candidates(id) on delete restrict,
  decided_at timestamptz not null default now()
);

-- 하나의 방은 한 번만 확정 (중복 확정 방지)
create unique index if not exists uq_meal_history_room_id
  on public.meal_history (room_id);

create index if not exists idx_meal_history_decided_at
  on public.meal_history (decided_at desc);

comment on table public.meal_history is '식사 이력 (MealHistory)';
comment on column public.meal_history.room_id is '해당 투표 방 ID';
comment on column public.meal_history.final_candidate_id is '최종 선택된 메뉴 후보 ID';
comment on column public.meal_history.decided_at is '결정 시각';

