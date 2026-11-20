export const getTripColor = (dsId: number): string => {
  let hash = dsId;
  hash = ((hash << 5) - hash) + 12345; // seed it
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 85%, 55%)`;
};
export const formatTime = (value: string | null | undefined): string => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};