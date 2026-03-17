type ApiErrorBody = {
  message?: unknown;
};

async function safeJson(response: Response): Promise<unknown | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function getErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  const payload = (await safeJson(response)) as ApiErrorBody | null;
  const message =
    payload && typeof payload.message === "string" ? payload.message.trim() : "";
  return message.length > 0 ? message : fallbackMessage;
}

