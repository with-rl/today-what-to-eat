'use client';

import { useState, type FormEvent } from "react";
import type { MenuCandidate } from "@/lib/types/domain";
import { getErrorMessage } from "@/lib/utils/http";

interface AddCandidateFormProps {
  roomId: string;
  onCreated?: (candidate: MenuCandidate) => void;
  isClosed?: boolean;
}

interface CreateCandidateResponse {
  candidate: MenuCandidate;
}

export function AddCandidateForm({
  roomId,
  onCreated,
  isClosed = false,
}: AddCandidateFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isClosed) {
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("메뉴 이름을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/v1/rooms/${roomId}/candidates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          description:
            description.trim().length > 0 ? description.trim() : null,
        }),
      });

      if (!response.ok) {
        setErrorMessage(
          await getErrorMessage(
            response,
            "메뉴 후보 추가에 실패했어요. 잠시 후 다시 시도해주세요.",
          ),
        );
        setIsSubmitting(false);
        return;
      }

      const data = (await response.json()) as CreateCandidateResponse;

      setName("");
      setDescription("");
      setIsSubmitting(false);

      if (onCreated) {
        onCreated(data.candidate);
      } else {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent<MenuCandidate>("candidate:created", {
              detail: data.candidate,
            }),
          );
        }
      }
    } catch {
      setErrorMessage(
        "네트워크 오류가 발생했어요. 인터넷 연결을 확인한 뒤 다시 시도해주세요.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div className="space-y-1.5">
        <label
          htmlFor="menu-name"
          className="block text-xs font-medium text-slate-700 dark:text-slate-200"
        >
          메뉴 이름 <span className="text-amber-500">*</span>
        </label>
        <input
          id="menu-name"
          name="name"
          type="text"
          placeholder="예: 초밥, 김치찌개, 회사 근처 A식당 정식"
          className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 transition-colors duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
          value={name}
          disabled={isSubmitting || isClosed}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="menu-description"
          className="block text-xs font-medium text-slate-700 dark:text-slate-200"
        >
          간단 설명 / 가게 이름{" "}
          <span className="text-slate-400">(선택)</span>
        </label>
        <input
          id="menu-description"
          name="description"
          type="text"
          placeholder="예: 회사 근처 B초밥집, 매운맛 조절 가능"
          className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 transition-colors duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
          value={description}
          disabled={isSubmitting || isClosed}
          onChange={(event) => setDescription(event.target.value)}
        />
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          메뉴 이름만 적어도 괜찮지만, 가게 이름이나 옵션을 같이 적어 두면 나중에
          선택할 때 더 도움이 돼요.
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-500/60 dark:bg-rose-900/40 dark:text-rose-100">
          {errorMessage}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
          팀원들이 떠오르는 대로 메뉴를 자유롭게 추가할 수 있어요. 중복 메뉴가
          생겨도 괜찮아요.
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-1">
        <button
          type="submit"
          disabled={isSubmitting || isClosed}
          className="inline-flex cursor-pointer items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-slate-950"
        >
          {isSubmitting
            ? "메뉴 추가 중..."
            : "메뉴 후보 추가하기"}
        </button>
      </div>
    </form>
  );
}

