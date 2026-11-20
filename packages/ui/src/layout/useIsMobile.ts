import { useEffect, useState } from "react";

export const useIsMobile = (breakpoint = 1024) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth <= breakpoint,
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
};
