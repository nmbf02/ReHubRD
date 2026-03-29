"use client";

import { useEffect, useState } from "react";

/** True after the component has mounted in the browser (avoids SSR/hydration mismatch with browser-only APIs). */
export function useIsClientMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
