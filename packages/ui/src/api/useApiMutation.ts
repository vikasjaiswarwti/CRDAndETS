// src/shared/hooks/useApiMutation.ts
// ─────────────────────────────────────────────────────────────────────────────
// Fix: Use readonly array to match RTK Query's return type
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback } from "react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { SerializedError } from "./api-error.types";
import { normalizeError } from "./normalize-error";
import type { AppError } from "./api-error.types";

// ── RTK mutation hook shape - FIX: Use readonly array ───────────────────────

type MutationHook<TArg, TResult> = () => readonly [
  (arg: TArg) => { unwrap: () => Promise<TResult> },
  { isLoading: boolean; error?: unknown; reset: () => void },
];

interface UseApiMutationOptions<TResult> {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (result: TResult) => void;
  onError?: (error: AppError) => void;
  showToast?: boolean;
}

interface UseApiMutationReturn<TArg, TResult> {
  mutate: (arg: TArg) => Promise<TResult | null>;
  isLoading: boolean;
  error: AppError | null;
  reset: () => void;
}

export function useApiMutation<TArg, TResult>(
  useMutation: MutationHook<TArg, TResult>,
  options: UseApiMutationOptions<TResult> = {},
): UseApiMutationReturn<TArg, TResult> {
  const {
    successMessage,
    errorMessage,
    onSuccess,
    onError,
    showToast = true,
  } = options;

  const [trigger, { isLoading, error: rawError, reset }] = useMutation();

  const mutate = useCallback(
    async (arg: TArg): Promise<TResult | null> => {
      try {
        const result = await trigger(arg).unwrap();

        if (showToast && successMessage) {
          import("antd").then(({ message }) => {
            message.success(successMessage);
          });
        }

        onSuccess?.(result);
        return result;
      } catch (err) {
        const appError = normalizeError(err);

        if (showToast) {
          const msg = errorMessage ?? appError.message;
          import("antd").then(({ message }) => {
            message.error(msg, 4);
          });
        }

        onError?.(appError);
        return null;
      }
    },
    [trigger, successMessage, errorMessage, onSuccess, onError, showToast],
  );

  return {
    mutate,
    isLoading,
    error: rawError ? normalizeError(rawError) : null,
    reset,
  };
}

// ── normaliseQueryResult ──────────────────────────────────────────────────────
// Use when you need the normalised AppError from a useQuery call
// without wrapping in ApiStateWrapper.

interface NormalisedQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  error: AppError | null;
  refetch: () => void;
}

export function normaliseQueryResult<T>(result: {
  data?: T;
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  error?: FetchBaseQueryError | SerializedError | undefined;
  refetch: () => void;
}): NormalisedQueryResult<T> {
  return {
    data: result.data,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    isSuccess: result.isSuccess,
    error: result.error ? normalizeError(result.error) : null,
    refetch: result.refetch,
  };
}
