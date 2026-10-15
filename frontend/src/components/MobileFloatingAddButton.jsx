import { Plus } from "lucide-react";

import { motion } from "motion/react";

/* =========================================================
   MOBILE FLOATING ADD BUTTON

   Mobile only.

   Positioned above the existing mobile navigation.

   Usage:

   <MobileFloatingAddButton
     label="Add card"
     onClick={() => setModalOpen(true)}
   />
========================================================= */

function MobileFloatingAddButton({ onClick, label = "Add", disabled = false }) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      title={label}
      initial={{
        opacity: 0,
        scale: 0.8,
        y: 12,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.85,
        y: 8,
      }}
      whileTap={
        disabled
          ? undefined
          : {
              scale: 0.9,
            }
      }
      transition={{
        type: "spring",
        stiffness: 450,
        damping: 28,
      }}
      className="
        fixed
        right-4
        z-[90]

        flex
        h-14
        w-14
        items-center
        justify-center

        rounded-full

        border-[3px]
        border-white

        bg-black
        text-white

        shadow-[0_10px_30px_rgba(0,0,0,0.28)]

        outline-none

        transition-colors

        active:bg-gray-800

        focus-visible:ring-2
        focus-visible:ring-black
        focus-visible:ring-offset-2

        disabled:cursor-not-allowed
        disabled:opacity-50

        sm:hidden
      "
      style={{
        bottom: "calc(118px + env(safe-area-inset-bottom))",
      }}
    >
      <Plus size={22} strokeWidth={2} />
    </motion.button>
  );
}

export default MobileFloatingAddButton;
