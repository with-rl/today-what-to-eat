'use client';

import { useState } from "react";

interface CopyShareButtonProps {
  roomTitle: string;
  menuName: string;
  teamLabel?: string | null;
}

export function CopyShareButton({
  roomTitle,
  menuName,
  teamLabel,
}: CopyShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCopy = async () => {
    setErrorMessage(null);
    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "";
    const url = typeof window !== "undefined" ? window.location.href : "";

    const teamPart = teamLabel?.trim()
      ? `${teamLabel.trim()} `
      : "";

    const titlePart = roomTitle.trim() ? `(${roomTitle.trim()}) ` : "";

    const baseText = `오늘 ${teamPart}점심 메뉴는 '${menuName}'으로 결정되었습니다! ${titlePart}`;
    const finalText = url ? `${baseText} (${url})` : `${baseText}${origin ? ` (${origin})` : ""}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(finalText);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = finalText;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      setErrorMessage("클립보드 복사에 실패했어요. 직접 복사해서 사용해주세요.");
    }
  };

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex cursor-pointer items-center justify-center rounded-full bg-emerald-600 px-4 py-1.5 text-[11px] font-semibold text-emerald-50 shadow-sm transition-colors duration-200 hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-50 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus-visible:ring-emerald-400 dark:focus-visible:ring-offset-slate-950"
      >
        {copied ? "결정 내용이 복사되었어요" : "결정 내용 복사하기"}
      </button>
      {errorMessage ? (
        <p className="max-w-xs text-[11px] text-emerald-900/80 dark:text-emerald-100/80">
          {errorMessage}
        </p>
      ) : (
        <p className="max-w-xs text-[11px] text-emerald-900/70 dark:text-emerald-100/70">
          버튼을 누르면 오늘의 메뉴와 링크가 한 줄 텍스트로 클립보드에 복사돼요.
        </p>
      )}
    </div>
  );
}

