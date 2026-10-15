import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createPortal } from "react-dom";

import { Check, ChevronDown, X } from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

/* =========================================================
   CONFIG
========================================================= */

const MOBILE_BREAKPOINT = "(max-width: 639px)";

const VIEWPORT_PADDING = 12;

const DROPDOWN_GAP = 8;

const MAX_DROPDOWN_HEIGHT = 360;

/* =========================================================
   MOBILE CHECK
========================================================= */

function getInitialMobileState() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(MOBILE_BREAKPOINT).matches;
}

/* =========================================================
   RESPONSIVE SELECT
========================================================= */

function ResponsiveSelect({
  label,
  value,
  options = [],
  onChange,
  error,
  required = true,
  disabled = false,
  placeholder = "Select an option",
  sheetDescription = "Choose an option below.",
}) {
  const triggerRef = useRef(null);

  const dropdownRef = useRef(null);

  const [open, setOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(getInitialMobileState);

  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 280,
    placement: "bottom",
  });

  /* =======================================================
     SELECTED
  ======================================================= */

  const selected = useMemo(
    () => options.find((option) => option.value === value) || null,
    [options, value],
  );

  const SelectedIcon = selected?.icon;

  /* =======================================================
     MOBILE WATCH
  ======================================================= */

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const media = window.matchMedia(MOBILE_BREAKPOINT);

    const update = () => {
      setIsMobile(media.matches);
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
  }, []);

  /* =======================================================
     CLOSE WHEN DISABLED
  ======================================================= */

  useEffect(() => {
    if (disabled) {
      setOpen(false);
    }
  }, [disabled]);

  /* =======================================================
     DESKTOP POSITION

     Uses estimated real menu height instead of subtracting
     the full max-height. This prevents the menu from
     jumping far above the field.
  ======================================================= */

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || typeof window === "undefined") {
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();

    const viewportWidth = window.innerWidth;

    const viewportHeight = window.innerHeight;

    const estimatedHeight = Math.min(
      MAX_DROPDOWN_HEIGHT,
      58 + options.length * 58 + 12,
    );

    let width = Math.max(rect.width, 280);

    width = Math.min(width, viewportWidth - VIEWPORT_PADDING * 2);

    let left = rect.left;

    if (left + width > viewportWidth - VIEWPORT_PADDING) {
      left = viewportWidth - width - VIEWPORT_PADDING;
    }

    left = Math.max(VIEWPORT_PADDING, left);

    const bottomPosition = rect.bottom + DROPDOWN_GAP;

    const fitsBelow =
      bottomPosition + estimatedHeight <= viewportHeight - VIEWPORT_PADDING;

    const placement = fitsBelow ? "bottom" : "top";

    let top = fitsBelow
      ? bottomPosition
      : rect.top - estimatedHeight - DROPDOWN_GAP;

    top = Math.max(
      VIEWPORT_PADDING,
      Math.min(top, viewportHeight - estimatedHeight - VIEWPORT_PADDING),
    );

    setPosition({
      top,
      left,
      width,
      placement,
    });
  }, [options.length]);

  /* =======================================================
     DESKTOP POSITION WATCH
  ======================================================= */

  useEffect(() => {
    if (!open || isMobile) {
      return undefined;
    }

    updatePosition();

    const handleUpdate = () => {
      updatePosition();
    };

    window.addEventListener("resize", handleUpdate);

    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      window.removeEventListener("resize", handleUpdate);

      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [open, isMobile, updatePosition]);

  /* =======================================================
     OUTSIDE CLICK

     Desktop only.

     Mobile uses its own backdrop.
  ======================================================= */

  useEffect(() => {
    if (!open || isMobile) {
      return undefined;
    }

    const handleOutside = (event) => {
      const trigger = triggerRef.current?.contains(event.target);

      const dropdown = dropdownRef.current?.contains(event.target);

      if (!trigger && !dropdown) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutside);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
    };
  }, [open, isMobile]);

  /* =======================================================
     ESCAPE

     Important:
     Close the dropdown first instead of closing ModalShell.
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();

      event.stopPropagation();

      event.stopImmediatePropagation();

      setOpen(false);

      requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    };

    document.addEventListener("keydown", handleEscape, true);

    return () => {
      document.removeEventListener("keydown", handleEscape, true);
    };
  }, [open]);

  /* =======================================================
     SELECT
  ======================================================= */

  const handleSelect = (option) => {
    onChange?.(option.value);

    setOpen(false);

    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  };

  /* =======================================================
     OPEN
  ======================================================= */

  const handleOpen = () => {
    if (disabled) {
      return;
    }

    if (!open) {
      updatePosition();
    }

    setOpen((current) => !current);
  };

  /* =======================================================
     OPTION
  ======================================================= */

  const renderOption = (option, mobile = false) => {
    const Icon = option.icon;

    const active = option.value === value;

    return (
      <button
        key={option.value}
        type="button"
        role="option"
        aria-selected={active}
        onClick={() => handleSelect(option)}
        className={`
          group
          flex
          w-full
          items-center
          gap-3
          text-left
          transition-colors

          ${
            mobile
              ? "min-h-[64px] rounded-xl px-3 py-2.5"
              : "rounded-lg px-2.5 py-2"
          }

          ${active ? "bg-gray-100" : "hover:bg-gray-50"}
        `}
      >
        {/* ICON */}

        {Icon && (
          <div
            className={`
              flex
              shrink-0
              items-center
              justify-center
              rounded-lg
              transition-colors

              ${mobile ? "h-10 w-10" : "h-8 w-8"}

              ${
                active
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-500 group-hover:bg-gray-200/70 group-hover:text-gray-800"
              }
            `}
          >
            <Icon size={mobile ? 16 : 14} strokeWidth={1.6} />
          </div>
        )}

        {/* TEXT */}

        <div className="min-w-0 flex-1">
          <p
            className={`
              truncate
              font-semibold
              text-gray-900

              ${mobile ? "text-[12px]" : "text-[11px]"}
            `}
          >
            {option.label}
          </p>

          {option.description && (
            <p
              className={`
                mt-0.5
                leading-4
                text-gray-400

                ${mobile ? "text-[9px]" : "text-[8px]"}
              `}
            >
              {option.description}
            </p>
          )}
        </div>

        {/* CHECK */}

        <div
          className={`
            flex
            shrink-0
            items-center
            justify-center
            rounded-full
            transition-all

            ${mobile ? "h-7 w-7" : "h-6 w-6"}

            ${
              active
                ? "bg-black text-white"
                : "border border-gray-200 bg-white text-transparent"
            }
          `}
        >
          <Check size={mobile ? 12 : 11} strokeWidth={2} />
        </div>
      </button>
    );
  };

  /* =======================================================
     DESKTOP DROPDOWN
  ======================================================= */

  const desktopDropdown = (
    <AnimatePresence>
      {open && !isMobile && (
        <motion.div
          ref={dropdownRef}
          role="listbox"
          aria-label={`Select ${label}`}
          initial={{
            opacity: 0,

            y: position.placement === "bottom" ? -5 : 5,

            scale: 0.985,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,

            y: position.placement === "bottom" ? -4 : 4,

            scale: 0.985,
          }}
          transition={{
            duration: 0.14,
            ease: "easeOut",
          }}
          style={{
            position: "fixed",

            top: position.top,

            left: position.left,

            width: position.width,

            maxHeight: MAX_DROPDOWN_HEIGHT,
          }}
          className="
                z-[10050]

                flex
                flex-col

                overflow-hidden

                rounded-xl

                border
                border-gray-200

                bg-white

                shadow-[0_20px_60px_rgba(0,0,0,0.18)]
              "
        >
          <div className="shrink-0 border-b border-gray-100 px-3.5 py-3">
            <p className="text-[10px] font-semibold text-gray-900">
              Select {label}
            </p>

            <p className="mt-0.5 text-[9px] text-gray-400">
              {sheetDescription}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
            <div className="space-y-0.5">
              {options.map((option) => renderOption(option, false))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* =======================================================
     MOBILE SELECTION SHEET

     This is the important mobile fix.

     No calculated top/left.
     No menu floating over the Add Card/User form.
  ======================================================= */

  const mobileSheet = (
    <AnimatePresence>
      {open && isMobile && (
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
          }}
          className="
                fixed
                inset-0
                z-[10050]

                flex
                items-end

                sm:hidden
              "
        >
          {/* BACKDROP */}

          <motion.button
            type="button"
            aria-label={`Close ${label} selection`}
            onClick={() => setOpen(false)}
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="
                  absolute
                  inset-0

                  cursor-default

                  bg-black/30

                  backdrop-blur-[1px]
                "
          />

          {/* SHEET */}

          <motion.div
            ref={dropdownRef}
            role="listbox"
            aria-label={`Select ${label}`}
            initial={{
              y: "100%",
            }}
            animate={{
              y: 0,
            }}
            exit={{
              y: "100%",
            }}
            transition={{
              type: "spring",
              stiffness: 410,
              damping: 38,
              mass: 0.9,
            }}
            className="
                  relative
                  z-10

                  w-full

                  max-h-[72dvh]

                  overflow-hidden

                  rounded-t-[26px]

                  border-t
                  border-gray-200

                  bg-white

                  pb-[max(env(safe-area-inset-bottom),12px)]

                  shadow-[0_-24px_70px_rgba(0,0,0,0.18)]
                "
          >
            {/* HANDLE */}

            <div className="flex h-8 items-center justify-center">
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>

            {/* HEADER */}

            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 pb-4 pt-1">
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-gray-950">
                  Select {label}
                </h3>

                <p className="mt-1 text-[9px] leading-4 text-gray-400">
                  {sheetDescription}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close selection"
                className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center

                      rounded-full

                      bg-gray-100

                      text-gray-500

                      transition-colors

                      active:bg-gray-200
                    "
              >
                <X size={14} strokeWidth={1.7} />
              </button>
            </div>

            {/* OPTIONS */}

            <div className="max-h-[calc(72dvh-100px)] overflow-y-auto overscroll-contain p-3">
              <div className="space-y-1">
                {options.map((option) => renderOption(option, true))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* =======================================================
     FIELD
  ======================================================= */

  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium text-gray-700">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={handleOpen}
        className={`
          group

          flex
          h-12
          w-full
          items-center
          gap-3

          rounded-lg

          border

          bg-white

          px-3

          text-left

          outline-none

          transition-all

          ${disabled ? "cursor-not-allowed bg-gray-50 opacity-60" : ""}

          ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
              : open
                ? "border-gray-400 ring-2 ring-gray-100"
                : "border-gray-200 hover:border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
          }
        `}
      >
        {/* ICON */}

        {SelectedIcon && (
          <div
            className={`
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center

              rounded-lg

              transition-colors

              ${open ? "bg-black text-white" : "bg-gray-100 text-gray-600"}
            `}
          >
            <SelectedIcon size={14} strokeWidth={1.6} />
          </div>
        )}

        {/* VALUE */}

        <div className="min-w-0 flex-1">
          <p
            className={`
              truncate
              text-[11px]
              font-semibold

              ${selected ? "text-gray-900" : "text-gray-400"}
            `}
          >
            {selected ? selected.label : placeholder}
          </p>

          {selected?.description && (
            <p className="mt-0.5 truncate text-[8px] text-gray-400">
              {selected.description}
            </p>
          )}
        </div>

        {/* CHEVRON */}

        <ChevronDown
          size={14}
          strokeWidth={1.6}
          className={`
            shrink-0
            text-gray-400
            transition-transform
            duration-150

            ${open ? "rotate-180" : ""}
          `}
        />
      </button>

      {error && <p className="mt-1.5 text-[10px] text-red-500">{error}</p>}

      {typeof document !== "undefined" &&
        createPortal(
          <>
            {desktopDropdown}

            {mobileSheet}
          </>,
          document.body,
        )}
    </div>
  );
}

export default ResponsiveSelect;
