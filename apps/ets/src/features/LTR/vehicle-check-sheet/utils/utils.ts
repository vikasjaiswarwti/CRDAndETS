import dayjs from "dayjs";

export const formatDateValue = (val: unknown): string | null => {
  console.log(val, "val");
  if (!val) return null;

  if (dayjs.isDayjs(val) || val instanceof Date) {
    return dayjs(val)?.format("YYYY-MM-DD");
  }

  if (typeof val === "string") {
    return dayjs(val).isValid() ? dayjs(val)?.format("YYYY-MM-DD") : val;
  }

  return null;
};

export const normalizeStatus = (
  statusValue: unknown,
): number | boolean | string | null => {
  if (
    statusValue === null ||
    statusValue === undefined ||
    statusValue === ""
  ) {
    return null;
  }

  if (typeof statusValue === "number") return statusValue;
  if (typeof statusValue === "boolean") return statusValue;

  const normalized = String(statusValue).trim().toLowerCase();
  if (["yes", "working", "ok", "true", "1"].includes(normalized)) return 1;
  if (
    ["no", "notworking", "not-working", "broken", "false", "0"].includes(
      normalized,
    )
  )
    return 0;

  return normalized;
};

export const extractApiError = (err: unknown): string => {
  const data = (err as { data?: Record<string, unknown> })?.data;

  if (!data) {
    return "Something went wrong. Please try again.";
  }

  if (data.errors && typeof data.errors === "object") {
    const messages = Object.values(data.errors as Record<string, unknown>)
      .flatMap((item) => (Array.isArray(item) ? item : [item]))
      .filter(Boolean);

    if (messages.length) {
      return String(messages[0]);
    }
  }

  const message = (data as { message?: string; title?: string }).message;
  const title = (data as { message?: string; title?: string }).title;

  return message ?? title ?? "Something went wrong. Please try again.";
};