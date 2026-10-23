import { useEffect } from "react";

let activeLockCount = 0;

let originalBodyOverflow = "";

let originalDocumentOverflow = "";

function acquireBodyScrollLock() {
  if (typeof document === "undefined") {
    return () => {};
  }

  if (activeLockCount === 0) {
    originalBodyOverflow =
      document.body.style.overflow;

    originalDocumentOverflow =
      document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  }

  activeLockCount += 1;

  let released = false;

  return () => {
    if (released) {
      return;
    }

    released = true;
    activeLockCount = Math.max(
      0,
      activeLockCount - 1,
    );

    if (activeLockCount === 0) {
      document.body.style.overflow =
        originalBodyOverflow;

      document.documentElement.style.overflow =
        originalDocumentOverflow;

      originalBodyOverflow = "";
      originalDocumentOverflow = "";
    }
  };
}

export default function useBodyScrollLock(
  locked = true,
) {
  useEffect(() => {
    if (!locked) {
      return undefined;
    }

    return acquireBodyScrollLock();
  }, [locked]);
}
