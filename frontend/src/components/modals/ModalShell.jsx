import { useEffect } from "react";
import { motion } from "motion/react";

export default function ModalShell({
  onClose,
  size = "max-w-md",
  role = "dialog",
  labelledBy,
  children,
}) {
  /* =========================================================
     ESCAPE + BODY SCROLL LOCK
  ========================================================= */

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
      className="
        fixed
        inset-0
        z-[300]
        flex
        items-center
        justify-center
        p-4
        sm:p-6
      "
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
        className="
          absolute
          inset-0
          cursor-default
          bg-black/45
          backdrop-blur-[2px]
        "
      />

      {/* =====================================================
          MODAL
      ===================================================== */}

      <motion.div
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        initial={{
          opacity: 0,
          y: 12,
          scale: 0.985,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: 8,
          scale: 0.985,
        }}
        transition={{
          duration: 0.17,
          ease: "easeOut",
        }}
        className={`
          relative
          z-10
          max-h-[calc(100vh-2rem)]
          w-full
          ${size}
          overflow-hidden
          rounded-xl
          border
          border-gray-200
          bg-white
          shadow-[0_20px_60px_rgba(0,0,0,0.18)]
        `}
      >
        {/* ===================================================
            SCROLLABLE MODAL CONTENT
        =================================================== */}

        <div
          className="
            max-h-[calc(100vh-2rem)]
            overflow-y-auto
            overscroll-contain
          "
        >
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
