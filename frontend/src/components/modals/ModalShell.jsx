import { useEffect, useState } from "react";

import { motion, useDragControls } from "motion/react";

/* =========================================================
   MODAL SHELL

   mobileSheet = false
   Desktop/mobile use the normal centered modal.

   mobileSheet = true
   Mobile becomes a native-feeling bottom sheet.
   Desktop remains a centered modal.
========================================================= */

export default function ModalShell({
  onClose,
  size = "max-w-md",
  role = "dialog",
  labelledBy,
  children,
  mobileSheet = false,
}) {
  const dragControls = useDragControls();

  const [mobileSheetMode, setMobileSheetMode] = useState(false);

  /* =======================================================
     MOBILE MODE
  ======================================================= */

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const media = window.matchMedia("(max-width: 639px)");

    const update = () => {
      setMobileSheetMode(mobileSheet && media.matches);
    };

    update();

    if (media.addEventListener) {
      media.addEventListener("change", update);

      return () => {
        media.removeEventListener("change", update);
      };
    }

    media.addListener(update);

    return () => {
      media.removeListener(update);
    };
  }, [mobileSheet]);

  /* =======================================================
     ESCAPE + BODY SCROLL LOCK
  ======================================================= */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);

      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  /* =======================================================
     DRAG CLOSE
  ======================================================= */

  const handleDragEnd = (_event, info) => {
    if (!mobileSheetMode) {
      return;
    }

    const draggedEnough = info.offset.y > 100;

    const fastSwipe = info.velocity.y > 700;

    if (draggedEnough || fastSwipe) {
      onClose?.();
    }
  };

  /* =======================================================
     MOTION
  ======================================================= */

  const initialMotion = mobileSheetMode
    ? {
        opacity: 1,
        y: "100%",
        scale: 1,
      }
    : {
        opacity: 0,
        y: 12,
        scale: 0.985,
      };

  const animateMotion = mobileSheetMode
    ? {
        opacity: 1,
        y: 0,
        scale: 1,
      }
    : {
        opacity: 1,
        y: 0,
        scale: 1,
      };

  const exitMotion = mobileSheetMode
    ? {
        opacity: 1,
        y: "100%",
        scale: 1,
      }
    : {
        opacity: 0,
        y: 8,
        scale: 0.985,
      };

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        duration: 0.14,
        ease: "easeOut",
      }}
      className={`
        fixed
        inset-0
        z-[300]

        flex
        justify-center

        ${mobileSheetMode ? "items-end p-0" : "items-center p-4 sm:p-6"}
      `}
    >
      {/* =====================================================
          BACKDROP
      ===================================================== */}

      <motion.button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
        }}
        transition={{
          duration: 0.14,
        }}
        className={`
          absolute
          inset-0
          cursor-default

          ${
            mobileSheetMode
              ? "bg-black/25 backdrop-blur-[1px]"
              : "bg-black/45 backdrop-blur-[2px]"
          }
        `}
      />

      {/* =====================================================
          MODAL / MOBILE SHEET
      ===================================================== */}

      <motion.div
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        initial={initialMotion}
        animate={animateMotion}
        exit={exitMotion}
        transition={
          mobileSheetMode
            ? {
                type: "spring",
                stiffness: 390,
                damping: 36,
                mass: 0.9,
              }
            : {
                duration: 0.17,
                ease: "easeOut",
              }
        }
        drag={mobileSheetMode ? "y" : false}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{
          top: 0,
          bottom: 0,
        }}
        dragElastic={{
          top: 0,
          bottom: 0.45,
        }}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        className={`
          relative
          z-10

          w-full
          ${size}

          overflow-hidden

          border
          border-gray-200

          bg-white

          ${
            mobileSheetMode
              ? `
                max-h-[92dvh]

                rounded-t-[28px]
                rounded-b-none

                border-x-0
                border-b-0

                shadow-[0_-20px_60px_rgba(0,0,0,0.16)]
              `
              : `
                max-h-[calc(100vh-2rem)]

                rounded-xl

                shadow-[0_20px_60px_rgba(0,0,0,0.18)]
              `
          }
        `}
      >
        {/* ===================================================
            MOBILE DRAG HANDLE
        =================================================== */}

        {mobileSheetMode && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Swipe down to close"
            onPointerDown={(event) => {
              dragControls.start(event);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();

                onClose?.();
              }
            }}
            style={{
              touchAction: "none",
            }}
            className="
              flex
              h-9
              cursor-grab
              items-center
              justify-center
              bg-white
              active:cursor-grabbing
            "
          >
            <motion.div
              whileTap={{
                scaleX: 1.15,
              }}
              className="
                h-1
                w-10
                rounded-full
                bg-gray-300
              "
            />
          </div>
        )}

        {/* ===================================================
            SCROLLABLE CONTENT
        =================================================== */}

        <div
          className={`
            overflow-y-auto
            overscroll-contain

            ${
              mobileSheetMode
                ? "max-h-[calc(92dvh-36px)]"
                : "max-h-[calc(100vh-2rem)]"
            }
          `}
        >
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
