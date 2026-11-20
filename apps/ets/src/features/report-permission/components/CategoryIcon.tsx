// import {
//   AppstoreOutlined,
//   BarChartOutlined,
//   SafetyCertificateOutlined,
//   DashboardOutlined,
//   MessageOutlined,
//   CalendarOutlined,
//   CarOutlined,
//   UserOutlined,
//   CarFilled,
// } from "@ant-design/icons";

// const CategoryIcon: React.FC<{ category: string; color: string }> = ({
//   category,
//   color,
// }) => {
//   switch (category) {
//     case "Trip":
//       return (
//         <svg
//           width="18"
//           height="18"
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke={color}
//           strokeWidth={1.8}
//         >
//           <path d="M3 17l2-8h14l2 8H3z" />
//           <circle cx="7.5" cy="19.5" r="1.5" />
//           <circle cx="16.5" cy="19.5" r="1.5" />
//           <path d="M5 9V5h14v4" />
//         </svg>
//       );
//     case "Compliance":
//       return (
//         <svg
//           width="18"
//           height="18"
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke={color}
//           strokeWidth={1.8}
//         >
//           <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
//           <polyline points="9 12 11 14 15 10" />
//         </svg>
//       );
//     case "Operations":
//       return (
//         <svg
//           width="18"
//           height="18"
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke={color}
//           strokeWidth={1.8}
//         >
//           <rect x="2" y="7" width="20" height="14" rx="2" />
//           <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
//           <line x1="12" y1="12" x2="12" y2="16" />
//           <line x1="10" y1="14" x2="14" y2="14" />
//         </svg>
//       );
//     case "Master Data":
//       return (
//         <svg
//           width="18"
//           height="18"
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke={color}
//           strokeWidth={1.8}
//         >
//           <ellipse cx="12" cy="5" rx="9" ry="3" />
//           <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
//           <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
//         </svg>
//       );
//     default:
//       return (
//         <svg
//           width="18"
//           height="18"
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke={color}
//           strokeWidth={1.8}
//         >
//           <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
//           <polyline points="14 2 14 8 20 8" />
//         </svg>
//       );
//   }
// };

const CategoryIcon: React.FC<{ category: string; color: string }> = ({
  category,
  color,
}) => {
  switch (category) {
    case "All Categories":
      return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );

    case "Analytics":
      return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}>
          <path d="M5 19V10" />
          <path d="M12 19V5" />
          <path d="M19 19V13" />
        </svg>
      );

    case "Compliance":
      return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      );

    case "Dashboard":
      return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}>
          <rect x="3" y="3" width="8" height="8" rx="1" />
          <rect x="13" y="3" width="8" height="5" rx="1" />
          <rect x="13" y="10" width="8" height="11" rx="1" />
          <rect x="3" y="13" width="8" height="8" rx="1" />
        </svg>
      );

    case "Feedback":
      return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}>
          <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );

    case "Schedule":
      return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );

    case "Trip":
      return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}>
          <path d="M3 17l2-8h14l2 8H3z" />
          <circle cx="7.5" cy="19.5" r="1.5" />
          <circle cx="16.5" cy="19.5" r="1.5" />
          <path d="M5 9V5h14v4" />
        </svg>
      );

    case "User":
      return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
        </svg>
      );

    case "Vehicle":
      return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}>
          <rect x="3" y="10" width="18" height="6" rx="2" />
          <path d="M7 10l2-4h6l2 4" />
          <circle cx="7" cy="18" r="1.5" />
          <circle cx="17" cy="18" r="1.5" />
        </svg>
      );

    case "Operations":
      return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <line x1="12" y1="12" x2="12" y2="16" />
          <line x1="10" y1="14" x2="14" y2="14" />
        </svg>
      );

    case "Master Data":
      return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );

    default:
      return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
  }
};
export default CategoryIcon;