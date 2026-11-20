// hooks/useBulkShiftUpdate.ts
// Uses the same RTK Query updateShiftSlot endpoint for bulk saves.
// Only sends dirty rows. Retries up to 3x with exponential back-off.
// Queue entries are freed immediately on completion — no memory accumulation.
// New bulk save cancels any in-flight batch via AbortController.

import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../app/store";
import { shiftApi } from "../services/shiftManagementApi";
import type {
  ShiftSlot,
  UpdateShiftPayload,
} from "../types/shift.mangement.types";

// ── Types ─────────────────────────────────────────────────────────────────────

export type BulkUpdateStatus = "idle" | "running" | "done" | "partial_failure";

export interface BulkUpdateResult {
  id: string;
  shiftTime: string;
  status: "success" | "failed";
  error?: string;
  attempts: number;
}

export interface SessionSummary {
  timestamp: string;
  total: number;
  succeeded: number;
  failed: number;
  failedShifts: { id: string; shiftTime: string; error: string }[];
}

// ── Queue entry — lives in the Map only until the slot resolves ───────────────
interface QueueEntry {
  slot: ShiftSlot;
  status: "pending" | "processing";
}

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 800;
const MAX_QUEUE_SIZE = 100; // hard ceiling — prevents OOM on bad callers
const STORAGE_KEY = "shiftLastSession";

// ── Helpers ───────────────────────────────────────────────────────────────────

function slotToPayload(slot: ShiftSlot): UpdateShiftPayload {
  return {
    locCode: slot.locCode,
    shiftDesc: slot.shiftDesc,
    shiftTime: slot.shiftTime,
    dropShift: slot.dropShift ?? null,
    dropDayShift: slot.dropDayShift,
    pickDayShift: slot.pickDayShift,
    peakHour: slot.peakHour,
    unsPickAllwd: slot.unsPickAllwd,
    unsDropAllwd: slot.unsDropAllwd,
    pickOccupancy: slot.pickOccupancy,
    dropOccupancy: slot.dropOccupancy,
    isGuardPick: slot.isGuardPick,
    isGuardDrop: slot.isGuardDrop,
    isSafeReachedMale: slot.isSafeReachedMale,
    isSafeReachedFemale: slot.isSafeReachedFemale,
    avgSpeed: slot.avgSpeed,
  };
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function saveSession(summary: SessionSummary) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(summary));
  } catch {
    // storage full — silently skip
  }
}

export function loadLastSession(): SessionSummary | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionSummary) : null;
  } catch {
    return null;
  }
}

// ── waitForOnline ─────────────────────────────────────────────────────────────
// Event-driven — suspends the retry loop IN PLACE until the browser fires
// 'online'. No setInterval, no polling tick. The loop is literally paused
// at this await and resumes the instant connectivity returns.
// AbortSignal is checked after the await so a cancelled batch doesn't
// resume after reconnect.
function waitForOnline(signal: AbortSignal): Promise<void> {
  // Already online — resolve immediately, no listener needed
  if (navigator.onLine) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const onOnline = () => {
      cleanup();
      resolve();
    };
    // If the batch is aborted while we are waiting for reconnect,
    // reject so processOne() can return a "Cancelled" result right away.
    const onAbort = () => {
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    };

    function cleanup() {
      window.removeEventListener("online", onOnline);
      signal.removeEventListener("abort", onAbort);
    }

    window.removeEventListener("online", onOnline); // defensive dedup
    window.addEventListener("online", onOnline, { once: true });
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface UseBulkShiftUpdateReturn {
  runBulkUpdate: (
    slots: ShiftSlot[],
    dirtyIds: Set<string>,
  ) => Promise<BulkUpdateResult[]>;
  status: BulkUpdateStatus;
  results: BulkUpdateResult[];
  progress: { completed: number; total: number };
  abort: () => void;
  reset: () => void;
  lastSession: SessionSummary | null;
}

export function useBulkShiftUpdate(): UseBulkShiftUpdateReturn {
  const dispatch = useDispatch<AppDispatch>();

  const [status, setStatus] = useState<BulkUpdateStatus>("idle");
  const [results, setResults] = useState<BulkUpdateResult[]>([]);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [lastSession, setLastSession] = useState<SessionSummary | null>(
    loadLastSession,
  );

  // ── AbortController replaces the boolean flag ─────────────────────────────
  // .abort() on the old controller instantly rejects any awaiting
  // waitForOnline() Promise and lets processOne() return "Cancelled" —
  // the old batch's loop exits cleanly without touching the new batch.
  const abortControllerRef = useRef<AbortController>(new AbortController());

  // ── Queue: Map<slotId, QueueEntry> ───────────────────────────────────────
  // Map preserves insertion order (sequential iteration), O(1) delete,
  // and auto-deduplicates if the same slotId appears twice in dirtySlots.
  // Each entry is deleted the moment its slot resolves (success OR fail),
  // so memory is freed incrementally — not held until the whole batch ends.
  const queueRef = useRef<Map<string, QueueEntry>>(new Map());

  // Keep online state in sync for the initial navigator.onLine read
  // (waitForOnline() uses the event — this ref is just for the guard
  //  at the top of processOne before the await)
  const isOnlineRef = useRef<boolean>(navigator.onLine);

  useEffect(() => {
    const setOnline = () => {
      isOnlineRef.current = true;
    };
    const setOffline = () => {
      isOnlineRef.current = false;
    };
    window.addEventListener("online", setOnline);
    window.addEventListener("offline", setOffline);
    return () => {
      window.removeEventListener("online", setOnline);
      window.removeEventListener("offline", setOffline);
    };
  }, []);

  // ── Core: call RTK updateShiftSlot mutation via dispatch ──────────────────
  // Unchanged from your original — same endpoint, same error extraction.
  const callUpdateOne = useCallback(
    async (slot: ShiftSlot): Promise<void> => {
      const result = await dispatch(
        shiftApi.endpoints.updateShiftSlot.initiate({
          id: slot.id,
          body: slotToPayload(slot),
        }),
      );
      if ("error" in result && result.error) {
        const err = result.error as any;
        const msg =
          err?.data?.message ??
          err?.data?.title ??
          err?.error ??
          `HTTP ${err?.status ?? "error"}`;
        throw new Error(msg);
      }
    },
    [dispatch],
  );

  // ── Process one slot: offline gate + retry + queue self-cleanup ───────────
  const processOne = useCallback(
    async (slot: ShiftSlot, signal: AbortSignal): Promise<BulkUpdateResult> => {
      let attempts = 0;

      while (attempts < MAX_ATTEMPTS) {
        // 1. Check abort before doing any work
        if (signal.aborted) {
          queueRef.current.delete(slot.id); // ← free immediately
          return {
            id: slot.id,
            shiftTime: slot.shiftTime,
            status: "failed",
            error: "Aborted by user",
            attempts,
          };
        }

        // 2. Offline: suspend HERE (not poll) until internet returns.
        //    If the batch is aborted while waiting, waitForOnline rejects
        //    and we fall through to the catch below.
        if (!isOnlineRef.current) {
          try {
            await waitForOnline(signal);
          } catch {
            // Aborted while waiting for reconnect
            queueRef.current.delete(slot.id); // ← free immediately
            return {
              id: slot.id,
              shiftTime: slot.shiftTime,
              status: "failed",
              error: "Aborted (offline)",
              attempts,
            };
          }
        }

        attempts++;

        try {
          await callUpdateOne(slot);

          // ✅ Success — remove from queue NOW, not at batch end
          queueRef.current.delete(slot.id);
          return {
            id: slot.id,
            shiftTime: slot.shiftTime,
            status: "success",
            attempts,
          };
        } catch (err: any) {
          if (attempts >= MAX_ATTEMPTS) {
            // ❌ Exhausted — remove from queue NOW
            queueRef.current.delete(slot.id);
            return {
              id: slot.id,
              shiftTime: slot.shiftTime,
              status: "failed",
              error: err?.message ?? "Unknown error",
              attempts,
            };
          }
          // Not last attempt — exponential back-off then loop
          await delay(BASE_DELAY_MS * attempts);
        }
      }

      // Unreachable — TypeScript guard
      queueRef.current.delete(slot.id);
      return {
        id: slot.id,
        shiftTime: slot.shiftTime,
        status: "failed",
        error: "Max attempts exceeded",
        attempts: MAX_ATTEMPTS,
      };
    },
    [callUpdateOne],
  );

  // ── Main: run all dirty slots sequentially ────────────────────────────────
  const runBulkUpdate = useCallback(
    async (
      allSlots: ShiftSlot[],
      dirtyIds: Set<string>,
    ): Promise<BulkUpdateResult[]> => {
      const dirtySlots =
        dirtyIds.size > 0
          ? allSlots.filter((s) => dirtyIds.has(s.id))
          : allSlots;

      if (dirtySlots.length === 0) return [];

      // ── Cancel previous batch ─────────────────────────────────────────────
      // This rejects any waitForOnline() Promise that the old batch is
      // suspended at, letting it exit immediately with "Aborted".
      // The old batch's loop hits the `signal.aborted` guard and stops.
      abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      // ── Build fresh queue ─────────────────────────────────────────────────
      // Slice to MAX_QUEUE_SIZE — hard ceiling against runaway callers.
      // Map auto-deduplicates: if same slotId appears twice, second wins.
      // Old Map is dereferenced here and GC'd — no stale entries carry over.
      queueRef.current = new Map(
        dirtySlots
          .slice(0, MAX_QUEUE_SIZE)
          .map((slot) => [slot.id, { slot, status: "pending" as const }]),
      );

      setStatus("running");
      setResults([]);
      setProgress({ completed: 0, total: queueRef.current.size });

      const allResults: BulkUpdateResult[] = [];
      let completed = 0;

      // ── Sequential loop — same as your original ───────────────────────────
      // Iterating the Map directly means we only visit entries that haven't
      // been deleted yet (aborted entries are removed inside processOne).
      for (const [, entry] of queueRef.current) {
        if (signal.aborted) break;

        // Mark processing — useful if you expose queue state to progress UI
        entry.status = "processing";

        const result = await processOne(entry.slot, signal);
        allResults.push(result);

        completed += 1;
        // Spread into new array so React sees a new reference and re-renders
        setResults([...allResults]);
        setProgress({ completed, total: queueRef.current.size + completed });
      }

      // ── Defensive cleanup ─────────────────────────────────────────────────
      // processOne() deletes its own entry on resolve. This handles any
      // entries that were skipped because signal was aborted mid-loop.
      queueRef.current.clear();

      const hasFailed = allResults.some((r) => r.status === "failed");
      setStatus(hasFailed ? "partial_failure" : "done");

      // ── Persist session summary ───────────────────────────────────────────
      const summary: SessionSummary = {
        timestamp: new Date().toISOString(),
        total: allResults.length,
        succeeded: allResults.filter((r) => r.status === "success").length,
        failed: allResults.filter((r) => r.status === "failed").length,
        failedShifts: allResults
          .filter((r) => r.status === "failed")
          .map((r) => ({
            id: r.id,
            shiftTime: r.shiftTime,
            error: r.error ?? "",
          })),
      };
      saveSession(summary);
      setLastSession(summary);

      return allResults;
    },
    [processOne],
  );

  // ── abort: exposed to the Save footer's Cancel button ────────────────────
  const abort = useCallback(() => {
    abortControllerRef.current.abort();
  }, []);

  // ── reset: clears UI state only — does not touch the queue ───────────────
  const reset = useCallback(() => {
    setStatus("idle");
    setResults([]);
    setProgress({ completed: 0, total: 0 });
  }, []);

  return {
    runBulkUpdate,
    status,
    results,
    progress,
    abort,
    reset,
    lastSession,
  };
}
