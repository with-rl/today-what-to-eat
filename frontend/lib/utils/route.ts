import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";

export async function parseJsonBody<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<
  | { ok: true; data: T }
  | { ok: false; response: NextResponse<{ message: string }> }
> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { message: "요청 본문(JSON)을 해석할 수 없어요." },
        { status: 400 },
      ),
    };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "요청 본문이 올바르지 않아요.";
    return {
      ok: false,
      response: NextResponse.json({ message }, { status: 400 }),
    };
  }

  return { ok: true, data: parsed.data };
}

