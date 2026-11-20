export const getActionBadge = (actionType: string | null | undefined) => {
  if (actionType === "A")
    return {
      label: "Approved",
      color: "#059669",
      bg: "#d1fae5",
      border: "#6ee7b7",
    };
  if (actionType === "R")
    return {
      label: "Rejected",
      color: "#dc2626",
      bg: "#fee2e2",
      border: "#fca5a5",
    };
  return {
    label: "Pending",
    color: "#d97706",
    bg: "#fef3c7",
    border: "#fcd34d",
  };
};
