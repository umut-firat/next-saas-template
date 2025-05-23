import { useCallback, useEffect, useRef } from "react";

import { useCallbackRef } from "@/hooks/use-callback-ref";

export function useDebouncedCallback<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number,
) {
  const handleCallback = useCallbackRef(callback);
  const debounceTimerRef = useRef(0);

  const setValue = useCallback(
    (...args: Parameters<T>) => {
      window.clearTimeout(debounceTimerRef.current);

      debounceTimerRef.current = window.setTimeout(
        () => handleCallback(...args),
        delay,
      );
    },
    [handleCallback, delay],
  );

  useEffect(() => () => window.clearTimeout(debounceTimerRef.current), []);

  return setValue;
}
