import { useEffect, useState } from "react";

/* =========================================================
   LOCAL STORAGE STATE

   Use only for UI preferences that should survive refresh.
   Example:
   - sidebar collapsed
   - table density
   - display preference

   Do NOT use this for page routing.
========================================================= */

function resolveInitialValue(initialValue) {
  return typeof initialValue === "function" ? initialValue() : initialValue;
}

export default function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(() => {
    const fallback = resolveInitialValue(initialValue);

    if (typeof window === "undefined") {
      return fallback;
    }

    try {
      const stored = window.localStorage.getItem(key);

      if (stored === null) {
        return fallback;
      }

      return JSON.parse(stored);
    } catch (error) {
      console.error(`Unable to read "${key}" from localStorage:`, error);

      return fallback;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Unable to save "${key}" to localStorage:`, error);
    }
  }, [key, value]);

  return [value, setValue];
}
