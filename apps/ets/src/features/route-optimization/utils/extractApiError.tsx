export function extractApiError(err: unknown): string {
  const data = (err as any)?.data;
  if (!data) return "An unexpected error occurred. Please try again.";
  if (data.errors && typeof data.errors === "object") {
    const messages: string[] = Object.values(
      data.errors as Record<string, string[]>,
    ).flat();
    if (messages.length > 0) return messages.join(" ");
  }
  return data.message ?? data.title ?? "An unexpected error occurred.";
}
