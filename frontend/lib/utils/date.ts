export function isExpired(expiresAt: string | null, now: Date = new Date()): boolean {
  if (!expiresAt) return false;
  const expires = new Date(expiresAt);
  if (Number.isNaN(expires.getTime())) return false;
  return expires.getTime() <= now.getTime();
}

const KO_TZ = "Asia/Seoul";

function safeDateFromIso(iso: string | null): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

const fmtKoTime = new Intl.DateTimeFormat("ko-KR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: KO_TZ,
});

const fmtKoMonthDay = new Intl.DateTimeFormat("ko-KR", {
  month: "2-digit",
  day: "2-digit",
});

const fmtKoMonthDayTime = new Intl.DateTimeFormat("ko-KR", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: KO_TZ,
});

const fmtKoShortMonthDayTime = new Intl.DateTimeFormat("ko-KR", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: KO_TZ,
});

const fmtKoYearMonthDay = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// Home page
export function formatKoTime(iso: string | null): string | null {
  const date = safeDateFromIso(iso);
  return date ? fmtKoTime.format(date) : null;
}

export function formatKoMonthDay(iso: string): string {
  const date = safeDateFromIso(iso);
  return date ? fmtKoMonthDay.format(date) : iso;
}

export function formatKoMonthDayTime(iso: string | null): string | null {
  const date = safeDateFromIso(iso);
  return date ? fmtKoMonthDayTime.format(date) : null;
}

// Room pages (month: "short", day: "numeric")
export function formatKoShortMonthDayTime(iso: string | null): string | null {
  const date = safeDateFromIso(iso);
  return date ? fmtKoShortMonthDayTime.format(date) : null;
}

// History page (year included)
export function formatKoYearMonthDay(iso: string): string {
  const date = safeDateFromIso(iso);
  return date ? fmtKoYearMonthDay.format(date) : iso;
}

