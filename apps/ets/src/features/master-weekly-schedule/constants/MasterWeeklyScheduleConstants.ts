import type { WeekDayCode } from "../../roaster";

// export const COLORS = {
//   primaryDark: "#1B4332",
//   primaryMid: "#52796F",
//   lightBorder: "#B7E4C7",
//   lightBg: "#F0FAF4",
//   border: "#E5E7EB",
//   textMuted: "#6B7280",
//   textBody: "#374151",
//   white: "#fff",
// } as const;

export const WEEK_DAYS: { code: WeekDayCode; label: string }[] = [
  { code: "SUN", label: "Sun" },
  { code: "MON", label: "Mon" },
  { code: "TUE", label: "Tue" },
  { code: "WED", label: "Wed" },
  { code: "THU", label: "Thu" },
  { code: "FRI", label: "Fri" },
  { code: "SAT", label: "Sat" },
];

const DAY_NAME_TO_CODE: Record<string, WeekDayCode> = {
  sunday: "SUN",
  monday: "MON",
  tuesday: "TUE",
  wednesday: "WED",
  thursday: "THU",
  friday: "FRI",
  saturday: "SAT",
};

// lock_Days from the list API may arrive as full day names ("Monday,Tuesday")
// or already as codes ("MON,TUE") — normalize both to WeekDayCode.
export const parseLockDays = (value: string | null | undefined): WeekDayCode[] => {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const upper = part.toUpperCase();
      const code = WEEK_DAYS.find((d) => d.code === upper)?.code;
      return code ?? DAY_NAME_TO_CODE[part.toLowerCase()];
    })
    .filter((code): code is WeekDayCode => Boolean(code));
};
