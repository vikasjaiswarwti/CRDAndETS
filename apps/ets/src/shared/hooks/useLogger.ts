// shared/hooks/useLogger.ts
import { useMemo } from "react";

import { ConsoleLogger } from "../lib/logging/logger";
import type { Logger } from "../lib/logging/logger";

export const useLogger = (context: string): Logger => {
  return useMemo(() => new ConsoleLogger(context), [context]);
};
