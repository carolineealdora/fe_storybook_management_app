import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "./api";

interface Result<T> {
  key: string;
  data?: T;
  error?: unknown;
}

/**
 * GET `path` and track loading / error / data. While a new path loads,
 * the previous data stays visible (filters don't flash a skeleton).
 */
export function useApi<T>(path: string) {
  const [version, setVersion] = useState(0);
  const key = `${path}#${version}`;
  const [result, setResult] = useState<Result<T>>();

  useEffect(() => {
    let cancelled = false;
    apiRequest<T>(path).then(
      (data) => !cancelled && setResult({ key, data }),
      (error: unknown) => !cancelled && setResult({ key, error }),
    );
    return () => {
      cancelled = true;
    };
  }, [key, path]);

  const loading = result?.key !== key;
  return {
    data: result?.data,
    error: loading ? undefined : result?.error,
    loading,
    reload: useCallback(() => setVersion((v) => v + 1), []),
  };
}
