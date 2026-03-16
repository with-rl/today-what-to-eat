"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";

type Status = "idle" | "checking" | "ok" | "error";

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkSupabase() {
      setStatus("checking");
      setMessage("");

      try {
        // 아주 간단한 ping 용 쿼리: 존재하지 않아도 되는 가벼운 RPC
        const { error } = await supabaseClient.from("pg_tables" as any).select("tablename").limit(1);

        if (error) {
          setStatus("error");
          setMessage(error.message);
        } else {
          setStatus("ok");
          setMessage("Supabase 연결에 성공했어요.");
        }
      } catch (err) {
        const e = err as Error;
        setStatus("error");
        setMessage(e.message ?? "Unknown error");
      }
    }

    void checkSupabase();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-black">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
        <h1 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Supabase 연결 테스트
        </h1>
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          `.env.local`에 입력한 Supabase URL과 키가 잘 작동하는지 확인하는 간단한 페이지입니다.
        </p>

        <div className="mb-4 space-y-1 text-sm">
          <div className="font-medium text-zinc-800 dark:text-zinc-100">
            상태:{" "}
            <span
              className={
                status === "ok"
                  ? "text-emerald-600"
                  : status === "error"
                    ? "text-red-500"
                    : "text-zinc-500"
              }
            >
              {status === "idle" && "대기 중"}
              {status === "checking" && "확인 중..."}
              {status === "ok" && "정상 연결"}
              {status === "error" && "에러 발생"}
            </span>
          </div>
          {message && (
            <p className="break-all text-xs text-zinc-600 dark:text-zinc-400">{message}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            // 버튼으로 다시 확인할 수 있게
            window.location.reload();
          }}
          className="mt-2 w-full rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          다시 확인하기
        </button>

        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">
          이 테스트가 성공하면, 이후 실제 기능 구현에서도 같은 Supabase 설정을 그대로 사용할 수
          있습니다.
        </p>
      </div>
    </main>
  );
}
