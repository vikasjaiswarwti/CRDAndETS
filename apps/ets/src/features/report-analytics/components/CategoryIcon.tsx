const CategoryIcon: React.FC<{ category: string; color: string }> = ({
  category,
  color,
}) => {
  switch (category) {
    case "Trip":
      return (
        <svg
          width="18"
          height="18"
          fill="none"
          viewBox="0 0 24 24"
          stroke={color}
          strokeWidth={1.8}
        >
          <path d="M3 17l2-8h14l2 8H3z" />
          <circle cx="7.5" cy="19.5" r="1.5" />
          <circle cx="16.5" cy="19.5" r="1.5" />
          <path d="M5 9V5h14v4" />
        </svg>
      );
    case "Compliance":
      return (
        <svg
          width="18"
          height="18"
          fill="none"
          viewBox="0 0 24 24"
          stroke={color}
          strokeWidth={1.8}
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      );
    case "Operations":
      return (
        <svg
          width="18"
          height="18"
          fill="none"
          viewBox="0 0 24 24"
          stroke={color}
          strokeWidth={1.8}
        >
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <line x1="12" y1="12" x2="12" y2="16" />
          <line x1="10" y1="14" x2="14" y2="14" />
        </svg>
      );
    case "Master Data":
      return (
        <svg
          width="18"
          height="18"
          fill="none"
          viewBox="0 0 24 24"
          stroke={color}
          strokeWidth={1.8}
        >
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );
    default:
      return (
        <svg
          width="18"
          height="18"
          fill="none"
          viewBox="0 0 24 24"
          stroke={color}
          strokeWidth={1.8}
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
  }
};
export default CategoryIcon;