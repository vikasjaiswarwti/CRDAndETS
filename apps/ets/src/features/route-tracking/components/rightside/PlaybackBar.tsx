// import { useRef, useCallback, useMemo } from "react";
// import {
//   StepBackwardOutlined,
//   StepForwardOutlined,
//   PlayCircleFilled,
//   PauseCircleFilled,
// } from "@ant-design/icons";
// import { colors } from "../../style/styles";
// import { EVENT_COLORS } from "../LeftSidebar";
// import type { IntervalMark, EventMarker } from "../../utils/eventUtils";
// import { Tooltip } from "antd";

// const EVENT_LABELS: Record<string, string> = {
//   actualSignIn: "Sign in",
//   actualSignOut: "Sign out",
//   calls: "Call",
//   noShow: "No show",
//   gpsLoss: "GPS loss",
//   sos: "SOS",
//   overspeed: "Overspeed",
//   vehicleStop: "Stoppage",
//   networkLoss: "Network loss",
// };

// interface PlaybackBarProps {
//   progress: number;
//   isPlaying: boolean;
//   speed: number;
//   startTime: string;
//   endTime: string;
//   currentTime?: string;
//   onPlay: () => void;
//   onPause: () => void;
//   onPrev: () => void;
//   onNext: () => void;
//   onSpeedChange: (speed: number) => void;
//   onSeek: (progress: number) => void;
//   selectedEvents?: string[];
//   eventMarkers?: EventMarker[];
//   intervalMarks?: IntervalMark[]; // NEW: Interval marks for timeline
//   showIntervals?: boolean; // NEW: Toggle interval display
// }

// const SPEED_OPTIONS = [0.5, 1, 2, 4];

// export default function PlaybackBar({
//   progress,
//   isPlaying,
//   speed,
//   startTime,
//   endTime,
//   onPlay,
//   onPause,
//   onPrev,
//   onNext,
//   onSpeedChange,
//   onSeek,
//   selectedEvents = [],
//   eventMarkers = [],
//   intervalMarks = [],
//   showIntervals = true,
// }: PlaybackBarProps) {
//   const trackRef = useRef<HTMLDivElement>(null);
//   // const [hoveredInterval, setHoveredInterval] = useState<number | null>(null);

//   const handleTrackClick = useCallback(
//     (e: React.MouseEvent<HTMLDivElement>) => {
//       if (!trackRef.current) return;
//       const rect = trackRef.current.getBoundingClientRect();
//       const pct = Math.min(
//         100,
//         Math.max(0, ((e.clientX - rect.left) / rect.width) * 100),
//       );
//       onSeek(pct);
//     },
//     [onSeek],
//   );

//   const nextSpeed = () => {
//     const idx = SPEED_OPTIONS.indexOf(speed);
//     onSpeedChange(SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length]);
//   };

//   // Filter + group event markers by position
//   const visibleMarkers = eventMarkers.filter((m) =>
//     selectedEvents.includes(m.key),
//   );
//   // const markersByPct = visibleMarkers.reduce<Record<number, EventMarker[]>>(
//   //   (acc, m) => {
//   //     const key = Math.round(m.pct);
//   //     acc[key] = [...(acc[key] ?? []), m];
//   //     return acc;
//   //   },
//   //   {},
//   // );

//   // Calculate marker area height for stacking
//   // const maxStack = Math.max(
//   //   ...Object.values(markersByPct).map((g) => g.length),
//   //   0,
//   // );
//   const totalDurationInMinutes = useMemo(() => {
//     if (!startTime || !endTime) return 60;

//     const parseTime = (timeStr: string): number => {
//       const [time, period] = timeStr.split(" ");
//       let [hours, minutes] = time.split(":").map(Number);
//       if (period === "PM" && hours !== 12) hours += 12;
//       if (period === "AM" && hours === 12) hours = 0;
//       return hours * 60 + minutes;
//     };

//     const startMinutes = parseTime(startTime);
//     const endMinutes = parseTime(endTime);

//     // Handle overnight cases (if end < start)
//     let duration = endMinutes - startMinutes;
//     if (duration < 0) duration += 24 * 60;

//     return Math.max(duration, 30); // minimum 30 mins
//   }, [startTime, endTime]);

//   // Group markers into 20-minute buckets
//   // Group by 20-minute bucket AND by event type
//   const groupedMarkers = useMemo(() => {
//     const bucketMap = new Map<string, Map<string, EventMarker[]>>(); // bucketKey -> eventKey -> markers

//     visibleMarkers.forEach((marker) => {
//       const minutesFromStart = (marker.pct / 100) * totalDurationInMinutes;
//       const bucketMinutes = Math.floor(minutesFromStart / 20) * 20;
//       const bucketKey = bucketMinutes.toString();

//       if (!bucketMap.has(bucketKey)) {
//         bucketMap.set(bucketKey, new Map());
//       }

//       const eventMap = bucketMap.get(bucketKey)!;
//       const eventKey = marker.key;

//       if (!eventMap.has(eventKey)) {
//         eventMap.set(eventKey, []);
//       }
//       eventMap.get(eventKey)!.push(marker);
//     });

//     const result: Array<{
//       pct: number;
//       eventKey: string;
//       markers: EventMarker[];
//       count: number;
//     }> = [];

//     bucketMap.forEach((eventMap, bucketKey) => {
//       const bucketMinutes = parseInt(bucketKey);
//       const basePct = (bucketMinutes / totalDurationInMinutes) * 100;

//       // For each event type in this bucket, create a separate pin
//       let offsetIndex = 0;
//       eventMap.forEach((markersInEvent, eventKey) => {
//         const pct = basePct + offsetIndex * 1.2; // small horizontal offset to avoid overlap

//         result.push({
//           pct: Math.min(99, Math.max(1, pct)),
//           eventKey,
//           markers: markersInEvent,
//           count: markersInEvent.length,
//         });

//         offsetIndex++;
//       });
//     });

//     return result.sort((a, b) => a.pct - b.pct);
//   }, [visibleMarkers, totalDurationInMinutes]);
//   // const markerAreaHeight = maxStack > 0 ? maxStack * 14 + 6 : 0;
//   return (
//     <div
//       style={{
//         position: "absolute",
//         bottom: 0,
//         left: 0,
//         right: 0,
//         background: "rgba(255,255,255,0.97)",
//         backdropFilter: "blur(24px)",
//         WebkitBackdropFilter: "blur(24px)",
//         borderTop: "1px solid #e5e7eb",
//         padding: "12px 16px",
//         zIndex: 20,
//         boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
//       }}
//     >
//       <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
//         {/* ── CONTROLS ── */}
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: 8,
//             flexShrink: 0,
//           }}
//         >
//           <IconBtn onClick={onPrev} title="Previous stop">
//             <StepBackwardOutlined />
//           </IconBtn>

//           <button
//             onClick={isPlaying ? onPause : onPlay}
//             title={isPlaying ? "Pause" : "Play"}
//             style={{
//               width: 42,
//               height: 42,
//               borderRadius: "50%",
//               background: colors.brandGreen,
//               border: "none",
//               cursor: "pointer",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               color: "#fff",
//               boxShadow: "0 4px 12px rgba(34,197,94,0.35)",
//             }}
//           >
//             {isPlaying ? (
//               <PauseCircleFilled style={{ fontSize: 18 }} />
//             ) : (
//               <PlayCircleFilled style={{ fontSize: 18 }} />
//             )}
//           </button>

//           <IconBtn onClick={onNext} title="Next stop">
//             <StepForwardOutlined />
//           </IconBtn>

//           <button
//             onClick={nextSpeed}
//             style={{
//               height: 28,
//               padding: "0 10px",
//               borderRadius: 10,
//               border: "1px solid #dbe2ea",
//               background: "#f8fafc",
//               cursor: "pointer",
//               fontWeight: 600,
//               fontSize: 12,
//               color: "#374151",
//             }}
//           >
//             {speed}x
//           </button>
//         </div>

//         {/* ── TRACK SECTION ── */}
//         <div
//           style={{
//             flex: 1,
//             display: "flex",
//             alignItems: "center",
//             gap: 12,
//             height: "70px",
//           }}
//         >
//           <span
//             style={{
//               fontSize: 12,
//               color: "#64748b",
//               fontWeight: 600,
//               minWidth: 58,
//             }}
//           >
//             {startTime}
//           </span>

//           {/* Track wrapper */}
//           <div
//             style={{
//               flex: 1,
//               position: "relative",
//               paddingTop: showIntervals ? 10 : 0,
//             }}
//           >
//             {/* ── EVENT MARKERS ── */}
//             {groupedMarkers.map(({ pct, eventKey, markers, count }) => {
//               const mainMarker = markers[0];
//               const tooltipId = `event-${eventKey}-${pct}`;
//               const tooltipTitle = (
//                 <>
//                   {mainMarker.label ?? EVENT_LABELS[eventKey] ?? eventKey}
//                   {count > 1 && ` (${count} events)`}
//                 </>
//               );

//               return (
//                 <Tooltip
//                   key={`event-${eventKey}-${pct}`}
//                   title={tooltipTitle}
//                   color="#1e293b"
//                   overlayInnerStyle={{
//                     borderLeft: `3px solid ${EVENT_COLORS[eventKey] ?? "#94a3b8"}`,
//                     fontSize: 11,
//                     fontWeight: 500,
//                   }}
//                   mouseEnterDelay={0.1}
//                   mouseLeaveDelay={0}
//                   placement="top"
//                 >
//                   <div
//                     key={tooltipId}
//                     style={{
//                       position: "absolute",
//                       left: `${pct}%`,
//                       top: -15,
//                       transform: "translateX(-50%)",
//                       display: "flex",
//                       flexDirection: "column",
//                       alignItems: "center",
//                       zIndex: 15,
//                       cursor: "default",
//                     }}
//                   >
//                     {/* Colored Pin with Count */}
//                     <div style={{ position: "relative" }}>
//                       <div
//                         style={{
//                           width: 10,
//                           height: 10,
//                           borderRadius: "50%",
//                           background: EVENT_COLORS[eventKey] ?? "#94a3b8",
//                           border: "2px solid #fff",
//                           boxShadow: "0 2px 5px rgba(0,0,0,0.25)",
//                         }}
//                       />

//                       {count > 1 && (
//                         <div
//                           style={{
//                             position: "absolute",
//                             top: -20,
//                             right: 0,
//                             background: `${EVENT_COLORS[eventKey] ?? "#94a3b8"}`,
//                             color: "#fff",
//                             fontSize: 10,
//                             fontWeight: 700,
//                             minWidth: 20,
//                             height: 20,
//                             borderRadius: "50%",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             border: "1.5px solid #fff",
//                             boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
//                           }}
//                         >
//                           {count}
//                         </div>
//                       )}
//                     </div>

//                     {/* Short Tick Line */}
//                     <div
//                       style={{
//                         width: 1.5,
//                         height: 12,
//                         background: EVENT_COLORS[eventKey] ?? "#94a3b8",
//                         opacity: 0.45,
//                         marginTop: 3,
//                       }}
//                     />
//                   </div>
//                 </Tooltip>
//               );
//             })}
//             {/* ── TRACK ── */}
//             <div
//               ref={trackRef}
//               onClick={handleTrackClick}
//               style={{
//                 position: "relative",
//                 height: 7,
//                 borderRadius: 999,
//                 background: "#e5e7eb",
//                 cursor: "pointer",
//               }}
//             >
//               {/* Progress fill */}
//               <div
//                 style={{
//                   position: "absolute",
//                   left: 0,
//                   top: 0,
//                   height: "100%",
//                   width: `${progress}%`,
//                   borderRadius: 999,
//                   background: "#22c55e",
//                   transition: "width 0.1s linear",
//                 }}
//               />

//               {/* Thumb */}
//               <div
//                 style={{
//                   position: "absolute",
//                   left: `${progress}%`,
//                   top: "50%",
//                   transform: "translate(-50%, -50%)",
//                   width: 15,
//                   height: 15,
//                   borderRadius: "50%",
//                   background: "#fff",
//                   border: "2.5px solid #22c55e",
//                   boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
//                   transition: "left 0.1s linear",
//                   pointerEvents: "none",
//                   zIndex: 7,
//                 }}
//               />
//             </div>
//             {/* ── INTERVAL MARKS (NEW) ── */}
//             {showIntervals && intervalMarks.length > 0 && (
//               <div
//                 style={{
//                   position: "absolute",
//                   top: 20,
//                   left: 0,
//                   right: 0,
//                   height: 22,
//                   display: "flex",
//                   alignItems: "flex-end",
//                 }}
//               >
//                 {intervalMarks.map((mark, idx) => {
//                   const isFirstOrLast =
//                     idx === 0 || idx === intervalMarks.length - 1;

//                   return (
//                     <div
//                       key={`interval-${idx}`}
//                       // onMouseEnter={() => setHoveredInterval(idx)}
//                       // onMouseLeave={() => setHoveredInterval(null)}
//                       style={{
//                         position: "absolute",
//                         left: `${mark.pct}%`,
//                         transform: "translateX(-50%)",
//                         display: "flex",
//                         flexDirection: "column",
//                         alignItems: "center",
//                         gap: 2,
//                         visibility: isFirstOrLast ? "hidden" : "visible",
//                       }}
//                     >
//                       <div
//                         style={{
//                           width: 1.5,
//                           height: 10,
//                           background: "#cbd5e1",
//                           flexShrink: 0,
//                         }}
//                       />
//                       <span
//                         style={{
//                           fontSize: 9,
//                           color: "#94a3b8",
//                           fontWeight: 500,
//                         }}
//                       >
//                         {mark.timeLabel}
//                       </span>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           <span
//             style={{
//               fontSize: 12,
//               color: "#64748b",
//               fontWeight: 600,
//               minWidth: 58,
//               textAlign: "right",
//             }}
//           >
//             {endTime}
//           </span>
//         </div>
//       </div>

//       {visibleMarkers.length > 0 && (
//         <div
//           style={{
//             display: "flex",
//             flexWrap: "wrap",
//             gap: 8,
//             marginTop: 10,
//             paddingTop: 8,
//             borderTop: "1px solid #f1f5f9",
//           }}
//         >
//           {[...new Set(visibleMarkers.map((m) => m.key))].map((key) => {
//             const count = visibleMarkers.filter((m) => m.key === key).length;
//             const eventColor = EVENT_COLORS[key] ?? "#94a3b8";
//             return (
//               <span
//                 key={key}
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 6,
//                   fontSize: 11,
//                   color: "#64748b",
//                   padding: "3px 10px",
//                   borderRadius: 20,
//                   border: "1px solid #e5e7eb",
//                   background: "#f8fafc",
//                 }}
//               >
//                 <span
//                   style={{
//                     width: 8,
//                     height: 8,
//                     borderRadius: "50%",
//                     background: eventColor,
//                     flexShrink: 0,
//                   }}
//                 />
//                 <span>{EVENT_LABELS[key] ?? key}</span>
//                 <span
//                   style={{
//                     background: "red",
//                     color: "#fff",
//                     fontSize: 10,
//                     fontWeight: 700,
//                     padding: "1px 6px",
//                     borderRadius: 12,
//                     minWidth: 18,
//                     textAlign: "center",
//                   }}
//                 >
//                   {count}
//                 </span>
//               </span>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

// function IconBtn({
//   onClick,
//   title,
//   children,
// }: {
//   onClick: () => void;
//   title?: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <button
//       onClick={onClick}
//       title={title}
//       style={{
//         width: 30,
//         height: 30,
//         borderRadius: "50%",
//         border: "1px solid #e5e7eb",
//         background: "#fff",
//         cursor: "pointer",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         color: "#374151",
//         transition: "background 0.12s",
//       }}
//     >
//       {children}
//     </button>
//   );
// }
import { useRef, useCallback, useMemo, useState, useEffect } from "react";
import {
  StepBackwardOutlined,
  StepForwardOutlined,
  PlayCircleFilled,
  PauseCircleFilled,
} from "@ant-design/icons";
import { colors } from "../../style/styles";
import { EVENT_COLORS } from "../LeftSidebar";
import type { IntervalMark, EventMarker } from "../../utils/eventUtils";
import { formatEventTimestamp } from "../../utils/commonFunction";
import { Popover } from "antd";

const EVENT_LABELS: Record<string, string> = {
  actualSignIn: "Sign in",
  actualSignOut: "Sign out",
  calls: "Call",
  noShow: "No show",
  gpsLoss: "GPS loss",
  sos: "SOS",
  overspeed: "Overspeed",
  vehicleStop: "Stoppage",
  networkLoss: "Network loss",
};

interface PlaybackBarProps {
  progress: number;
  isPlaying: boolean;
  speed: number;
  startTime: string;
  endTime: string;
  currentTime?: string;
  onPlay: () => void;
  onPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSpeedChange: (speed: number) => void;
  onSeek: (progress: number) => void;
  selectedEvents?: string[];
  eventMarkers?: EventMarker[];
  intervalMarks?: IntervalMark[]; // NEW: Interval marks for timeline
  showIntervals?: boolean; // NEW: Toggle interval display
}

const SPEED_OPTIONS = [0.5, 1, 2, 4];

export default function PlaybackBar({
  progress,
  isPlaying,
  speed,
  startTime,
  endTime,
  onPlay,
  onPause,
  onPrev,
  onNext,
  onSpeedChange,
  onSeek,
  selectedEvents = [],
  eventMarkers = [],
  intervalMarks = [],
  showIntervals = true,
}: PlaybackBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  // Tracks which pin's popover is currently open (by pinId). Only one at a time.
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  const handleTrackClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const pct = Math.min(
        100,
        Math.max(0, ((e.clientX - rect.left) / rect.width) * 100),
      );
      onSeek(pct);
    },
    [onSeek],
  );

  const nextSpeed = () => {
    const idx = SPEED_OPTIONS.indexOf(speed);
    onSpeedChange(SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length]);
  };

  // Filter + group event markers by position
  const visibleMarkers = eventMarkers.filter((m) =>
    selectedEvents.includes(m.key),
  );

  const totalDurationInMinutes = useMemo(() => {
    if (!startTime || !endTime) return 60;

    const parseTime = (timeStr: string): number => {
      const [time, period] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const startMinutes = parseTime(startTime);
    const endMinutes = parseTime(endTime);

    // Handle overnight cases (if end < start)
    let duration = endMinutes - startMinutes;
    if (duration < 0) duration += 24 * 60;

    return Math.max(duration, 30); // minimum 30 mins
  }, [startTime, endTime]);

  // Current playback position expressed in minutes-from-start.
  // Derived from `progress` using the SAME mapping used for marker `pct`,
  // so reveal comparisons stay consistent with marker positions.
  const currentMinutes = useMemo(
    () => (progress / 100) * totalDurationInMinutes,
    [progress, totalDurationInMinutes],
  );

  // Sticky "high-water mark" of playback progress. Once a marker's time
  // has been reached, it stays revealed even if the user rewinds/seeks back.
  const [maxRevealedMinutes, setMaxRevealedMinutes] = useState(0);

  useEffect(() => {
    setMaxRevealedMinutes((prev) =>
      currentMinutes > prev ? currentMinutes : prev,
    );
  }, [currentMinutes]);

  // Reset the high-water mark if playback restarts from (near) the beginning,
  // e.g. user clicks "restart" and progress drops back to 0.
  useEffect(() => {
    if (progress === 0) {
      setMaxRevealedMinutes(0);
    }
  }, [progress]);

  // Group markers into 20-minute buckets, keeping each bucket's start
  // minute so we can compare it against `maxRevealedMinutes` for reveal.
  const groupedMarkers = useMemo(() => {
    const bucketMap = new Map<string, Map<string, EventMarker[]>>(); // bucketKey -> eventKey -> markers

    visibleMarkers.forEach((marker) => {
      const minutesFromStart = (marker.pct / 100) * totalDurationInMinutes;
      const bucketMinutes = Math.floor(minutesFromStart / 20) * 20;
      const bucketKey = bucketMinutes.toString();

      if (!bucketMap.has(bucketKey)) {
        bucketMap.set(bucketKey, new Map());
      }

      const eventMap = bucketMap.get(bucketKey)!;
      const eventKey = marker.key;

      if (!eventMap.has(eventKey)) {
        eventMap.set(eventKey, []);
      }
      eventMap.get(eventKey)!.push(marker);
    });

    const result: Array<{
      pct: number;
      bucketMinutes: number;
      eventKey: string;
      markers: EventMarker[];
      count: number;
    }> = [];

    bucketMap.forEach((eventMap, bucketKey) => {
      const bucketMinutes = parseInt(bucketKey, 10);
      const basePct = (bucketMinutes / totalDurationInMinutes) * 100;

      // For each event type in this bucket, create a separate pin
      let offsetIndex = 0;
      eventMap.forEach((markersInEvent, eventKey) => {
        const pct = basePct + offsetIndex * 1.2; // small horizontal offset to avoid overlap

        result.push({
          pct: Math.min(99, Math.max(1, pct)),
          bucketMinutes,
          eventKey,
          markers: markersInEvent,
          count: markersInEvent.length,
        });

        offsetIndex++;
      });
    });

    return result.sort((a, b) => a.pct - b.pct);
  }, [visibleMarkers, totalDurationInMinutes]);

  // Only markers whose bucket time has been reached by playback are revealed.
  const revealedMarkers = useMemo(
    () => groupedMarkers.filter((m) => m.bucketMinutes <= maxRevealedMinutes),
    [groupedMarkers, maxRevealedMinutes],
  );

  // Legend/summary counts should reflect only what's actually been revealed,
  // not the full dataset — otherwise counts would spoil "future" events.
  const revealedIndividualMarkers = useMemo(
    () =>
      visibleMarkers.filter((m) => {
        const minutesFromStart = (m.pct / 100) * totalDurationInMinutes;
        const bucketMinutes = Math.floor(minutesFromStart / 20) * 20;
        return bucketMinutes <= maxRevealedMinutes;
      }),
    [visibleMarkers, totalDurationInMinutes, maxRevealedMinutes],
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid #e5e7eb",
        padding: "12px 16px",
        zIndex: 20,
        boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* ── CONTROLS ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <IconBtn onClick={onPrev} title="Previous stop">
            <StepBackwardOutlined />
          </IconBtn>

          <button
            onClick={isPlaying ? onPause : onPlay}
            title={isPlaying ? "Pause" : "Play"}
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: colors.brandGreen,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "0 4px 12px rgba(34,197,94,0.35)",
            }}
          >
            {isPlaying ? (
              <PauseCircleFilled style={{ fontSize: 18 }} />
            ) : (
              <PlayCircleFilled style={{ fontSize: 18 }} />
            )}
          </button>

          <IconBtn onClick={onNext} title="Next stop">
            <StepForwardOutlined />
          </IconBtn>

          <button
            onClick={nextSpeed}
            style={{
              height: 28,
              padding: "0 10px",
              borderRadius: 10,
              border: "1px solid #dbe2ea",
              background: "#f8fafc",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 12,
              color: "#374151",
            }}
          >
            {speed}x
          </button>
        </div>

        {/* ── TRACK SECTION ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 12,
            height: "70px",
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: "#64748b",
              fontWeight: 600,
              minWidth: 58,
            }}
          >
            {startTime}
          </span>

          {/* Track wrapper */}
          <div
            style={{
              flex: 1,
              position: "relative",
              paddingTop: showIntervals ? 10 : 0,
            }}
          >
            {/* ── EVENT MARKERS (only those reached by playback progress) ── */}
            {revealedMarkers.map(({ pct, eventKey, markers, count }) => {
              // const mainMarker = markers[0];
              const pinId = `${eventKey}-${pct}`;
              const isOpen = activeMarkerId === pinId;
              const pinColor = EVENT_COLORS[eventKey] ?? "#94a3b8";

              const popoverContent = (
                <div
                  style={{
                    maxWidth: 280,
                    maxHeight: 260,
                    overflowY: "auto",
                  }}
                >
                  {markers.map((marker, idx) => (
                    <div
                      key={`${pinId}-detail-${idx}`}
                      style={{
                        padding: "4px 0",
                        borderBottom:
                          idx < markers.length - 1
                            ? "1px solid #f1f5f9"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#1e293b",
                          marginBottom: 2,
                        }}
                      >
                        {marker.label ?? EVENT_LABELS[marker.key] ?? marker.key}
                      </div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>
                        Time: {formatEventTimestamp(marker.timestamp)}
                      </div>
                      {/* {marker.value !== undefined && (
                        <div style={{ fontSize: 11, color: "#64748b" }}>
                          Value: {marker.value}
                        </div>
                      )} */}
                    </div>
                  ))}
                </div>
              );

              return (
                <Popover
                  key={pinId}
                  content={popoverContent}
                  title={
                    <span style={{ fontSize: 12, fontWeight: 600 }}>
                      {EVENT_LABELS[eventKey] ?? eventKey}
                      {count > 1 && ` (${count} events)`}
                    </span>
                  }
                  trigger="click"
                  open={isOpen}
                  onOpenChange={(open) =>
                    setActiveMarkerId(open ? pinId : null)
                  }
                  placement="top"
                  overlayInnerStyle={{
                    borderLeft: `3px solid ${pinColor}`,
                  }}
                >
                  <div
                    key={pinId}
                    style={{
                      position: "absolute",
                      left: `${pct}%`,
                      top: -15,
                      transform: "translateX(-50%)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      zIndex: 15,
                      cursor: "pointer",
                    }}
                  >
                    {/* Colored Pin with Count */}
                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: EVENT_COLORS[eventKey] ?? "#94a3b8",
                          border: "2px solid #fff",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.25)",
                        }}
                      />

                      {count > 1 && (
                        <div
                          style={{
                            position: "absolute",
                            top: -20,
                            right: 0,
                            background: `${EVENT_COLORS[eventKey] ?? "#94a3b8"}`,
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: 700,
                            minWidth: 20,
                            height: 20,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1.5px solid #fff",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          }}
                        >
                          {count}
                        </div>
                      )}
                    </div>

                    {/* Short Tick Line */}
                    <div
                      style={{
                        width: 1.5,
                        height: 12,
                        background: EVENT_COLORS[eventKey] ?? "#94a3b8",
                        opacity: 0.45,
                        marginTop: 3,
                      }}
                    />
                  </div>
                </Popover>
              );
            })}
            {/* ── TRACK ── */}
            <div
              ref={trackRef}
              onClick={handleTrackClick}
              style={{
                position: "relative",
                height: 7,
                borderRadius: 999,
                background: "#e5e7eb",
                cursor: "pointer",
              }}
            >
              {/* Progress fill */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: `${progress}%`,
                  borderRadius: 999,
                  background: "#22c55e",
                  transition: "width 0.1s linear",
                }}
              />

              {/* Thumb */}
              <div
                style={{
                  position: "absolute",
                  left: `${progress}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 15,
                  height: 15,
                  borderRadius: "50%",
                  background: "#fff",
                  border: "2.5px solid #22c55e",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                  transition: "left 0.1s linear",
                  pointerEvents: "none",
                  zIndex: 7,
                }}
              />
            </div>
            {/* ── INTERVAL MARKS (NEW) ── */}
            {showIntervals && intervalMarks.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  left: 0,
                  right: 0,
                  height: 22,
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                {intervalMarks.map((mark, idx) => {
                  const isFirstOrLast =
                    idx === 0 || idx === intervalMarks.length - 1;

                  return (
                    <div
                      key={`interval-${idx}`}
                      style={{
                        position: "absolute",
                        left: `${mark.pct}%`,
                        transform: "translateX(-50%)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                        visibility: isFirstOrLast ? "hidden" : "visible",
                      }}
                    >
                      <div
                        style={{
                          width: 1.5,
                          height: 10,
                          background: "#cbd5e1",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 9,
                          color: "#94a3b8",
                          fontWeight: 500,
                        }}
                      >
                        {mark.timeLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <span
            style={{
              fontSize: 12,
              color: "#64748b",
              fontWeight: 600,
              minWidth: 58,
              textAlign: "right",
            }}
          >
            {endTime}
          </span>
        </div>
      </div>
      {revealedIndividualMarkers.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 10,
            paddingTop: 8,
            borderTop: "1px solid #f1f5f9",
          }}
        >
          {[...new Set(revealedIndividualMarkers.map((m) => m.key))].map(
            (key) => {
              const markersForKey = revealedIndividualMarkers.filter(
                (m) => m.key === key,
              );
              const count = markersForKey.length;
              const eventColor = EVENT_COLORS[key] ?? "#94a3b8";
              const legendId = `legend-${key}`;
              const isOpen = activeMarkerId === legendId;

              const popoverContent = (
                <div
                  style={{
                    maxWidth: 280,
                    maxHeight: 260,
                    overflowY: "auto",
                  }}
                >
                  {markersForKey.map((marker, idx) => (
                    <div
                      key={`${legendId}-detail-${idx}`}
                      style={{
                        padding: "4px 0",
                        borderBottom:
                          idx < markersForKey.length - 1
                            ? "1px solid #f1f5f9"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#1e293b",
                          marginBottom: 1,
                        }}
                      >
                        {marker.label ?? EVENT_LABELS[marker.key] ?? marker.key}
                      </div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>
                        Time: {formatEventTimestamp(marker.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              );

              return (
                <Popover
                  key={key}
                  content={popoverContent}
                  title={
                    <span style={{ fontSize: 12, fontWeight: 600 }}>
                      {EVENT_LABELS[key] ?? key} ({count})
                    </span>
                  }
                  trigger="click"
                  open={isOpen}
                  onOpenChange={(open) =>
                    setActiveMarkerId(open ? legendId : null)
                  }
                  placement="top"
                  overlayInnerStyle={{
                    borderLeft: `3px solid ${eventColor}`,
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 11,
                      color: "#64748b",
                      padding: "3px 4px",
                      borderRadius: 20,
                      border: "1px solid #e5e7eb",
                      background: "#f8fafc",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: eventColor,
                        flexShrink: 0,
                      }}
                    />
                    <span>{EVENT_LABELS[key] ?? key}</span>
                    <span
                      style={{
                        background: "red",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: 12,
                        minWidth: 18,
                        textAlign: "center",
                      }}
                    >
                      {count}
                    </span>
                  </span>
                </Popover>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}

function IconBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        border: "1px solid #e5e7eb",
        background: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#374151",
        transition: "background 0.12s",
      }}
    >
      {children}
    </button>
  );
}
