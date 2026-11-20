

// src/features/routeManagement/hooks/useSyncedScroll.ts

import { useCallback, useRef, useState } from "react";

/**
 * Raw DOM scroll synchronization. No react-window. No libraries.
 *
 * KEY DESIGN DECISIONS:
 *
 * 1. isSyncing is set to true BEFORE the assignment and reset
 *    synchronously AFTER — not in rAF. This works because
 *    scrollTop assignment fires the scroll event synchronously
 *    in the same call stack on all major browsers.
 *
 * 2. We read scrollTop from the event's currentTarget, not from
 *    ref.current — avoids stale closure reads.
 *
 * 3. Refs are typed as MutableRefObject so panels can assign them
 *    directly without forwardRef complexity (see usage below).
 */

export function useSyncedScroll() {
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [syncedSelectedIndex, setSyncedSelectedIndex] = useState<number | null>(null);
  const isSyncing = useRef(false);

  const onScrollLeft = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (isSyncing.current) return;
      const right = rightRef.current;
      if (!right) return;
      isSyncing.current = true;
      right.scrollTop = (e.currentTarget as HTMLDivElement).scrollTop;
      isSyncing.current = false;
    },
    [], // stable — refs are mutable, not reactive
  );

  const onScrollRight = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (isSyncing.current) return;
    const left = leftRef.current;
    if (!left) return;
    isSyncing.current = true;
    left.scrollTop = (e.currentTarget as HTMLDivElement).scrollTop;
    isSyncing.current = false;
  }, []);

  return { leftRef, rightRef, onScrollLeft, onScrollRight,  hoveredIndex, setHoveredIndex, syncedSelectedIndex, setSyncedSelectedIndex };
}
