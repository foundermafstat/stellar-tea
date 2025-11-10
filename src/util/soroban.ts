type SorobanErrorPayload = { message?: string } | Error | string;

export type SorobanResult<T> = {
  isErr: () => boolean;
  unwrap: () => T;
  unwrapErr: () => SorobanErrorPayload;
};

export const asSorobanResult = <T>(
  payload: unknown,
): SorobanResult<T> | null => {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "isErr" in payload &&
    typeof (payload as SorobanResult<T>).isErr === "function" &&
    typeof (payload as SorobanResult<T>).unwrap === "function" &&
    typeof (payload as SorobanResult<T>).unwrapErr === "function"
  ) {
    return payload as SorobanResult<T>;
  }

  return null;
};

export const extractSorobanErrorMessage = (
  reason: unknown,
  fallback: string,
): string => {
  if (!reason) {
    return fallback;
  }

  if (reason instanceof Error) {
    return reason.message || fallback;
  }

  if (
    typeof reason === "object" &&
    "message" in (reason as SorobanErrorPayload)
  ) {
    const { message } = reason as SorobanErrorPayload;
    return typeof message === "string" && message.length > 0
      ? message
      : fallback;
  }

  if (typeof reason === "string") {
    return reason;
  }

  return fallback;
};
