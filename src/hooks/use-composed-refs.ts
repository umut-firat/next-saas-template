import { useCallback } from "react";

import type { PossibleRef } from "@/lib/composition";
import { composeRefs } from "@/lib/composition";

export function useComposedRefs<T>(
  ...refs: PossibleRef<T>[]
): React.RefCallback<T> {
  return useCallback(composeRefs(...refs), refs);
}
