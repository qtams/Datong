import { useEffect, useMemo, useRef, useState } from "react";

import { createPortal } from "react-dom";

import {
  Check,
  ChevronDown,
  Eye,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import { USER_ROLE_OPTIONS } from "../../data/usersData";

/* =========================================================
   ROLE ICONS
========================================================= */

const ROLE_ICONS = {
  Admin: ShieldCheck,
  Finance: WalletCards,
  Staff: UserRound,
  Viewer: Eye,
};

/* =========================================================
   CONFIG
========================================================= */

const VIEWPORT_PADDING = 12;
const DROPDOWN_GAP = 8;
const MAX_DROPDOWN_HEIGHT = 320;

/* =========================================================
   ROLE SELECT
========================================================= */

function RoleSelect({
  value,
  onChange,
  error,
  label = "Role",
  required = true,
}) {
  const triggerRef = useRef(null);

  const dropdownRef = useRef(null);

  const [open, setOpen] = useState(false);

  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 280,
    maxHeight: MAX_DROPDOWN_HEIGHT,
    placement: "bottom",
  });

  /* =======================================================
     SELECTED ROLE
  ======================================================= */

  const selectedRole = useMemo(() => {
    return (
      USER_ROLE_OPTIONS.find((role) => role.value === value) ??
      USER_ROLE_OPTIONS[0]
    );
  }, [value]);

  const SelectedIcon = ROLE_ICONS[selectedRole.value] ?? ShieldCheck;

  /* =======================================================
     POSITION DROPDOWN
  ======================================================= */

  const updatePosition = () => {
    if (!triggerRef.current) {
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();

    const viewportHeight = window.innerHeight;

    const viewportWidth = window.innerWidth;

    const availableBelow = viewportHeight - rect.bottom - VIEWPORT_PADDING;

    const availableAbove = rect.top - VIEWPORT_PADDING;

    /*
     * Prefer below.
     * If below is tight and above has
     * more space, open upward.
     */
    const placement =
      availableBelow >= 230 || availableBelow >= availableAbove
        ? "bottom"
        : "top";

    const availableSpace =
      placement === "bottom" ? availableBelow : availableAbove;

    const maxHeight = Math.max(
      180,
      Math.min(MAX_DROPDOWN_HEIGHT, availableSpace - DROPDOWN_GAP),
    );

    let left = rect.left;

    let width = rect.width;

    /*
     * Keep menu aligned with field,
     * but don't let it become too narrow.
     */
    width = Math.max(280, width);

    if (left + width > viewportWidth - VIEWPORT_PADDING) {
      left = viewportWidth - width - VIEWPORT_PADDING;
    }

    left = Math.max(VIEWPORT_PADDING, left);

    let top;

    if (placement === "bottom") {
      top = rect.bottom + DROPDOWN_GAP;
    } else {
      top = rect.top - maxHeight - DROPDOWN_GAP;
    }

    top = Math.max(VIEWPORT_PADDING, top);

    setPosition({
      top,
      left,
      width,
      maxHeight,
      placement,
    });
  };

  /* =======================================================
     OPEN / RESIZE / SCROLL
  ======================================================= */

  useEffect(() => {
    if (!open) {
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
  }, [open]);

  /* =======================================================
     CLICK OUTSIDE
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      const clickedTrigger = triggerRef.current?.contains(event.target);

      const clickedDropdown = dropdownRef.current?.contains(event.target);

      if (!clickedTrigger && !clickedDropdown) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, [open]);

  /* =======================================================
     ESCAPE
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
     SELECT ROLE
  ======================================================= */

  const handleSelectRole = (role) => {
    onChange?.(role.value);

    setOpen(false);

    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  };

  /* =======================================================
     DROPDOWN
  ======================================================= */

  const dropdown = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dropdownRef}
          role="listbox"
          aria-label="Select role"
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
            maxHeight: position.maxHeight,
          }}
          className="
            z-[9999]
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
          {/* ===============================================
              HEADER
          =============================================== */}

          <div className="shrink-0 border-b border-gray-100 px-3.5 py-3">
            <p className="text-[10px] font-semibold text-gray-900">
              Select role
            </p>

            <p className="mt-0.5 text-[9px] text-gray-400">
              Choose the user's access level.
            </p>
          </div>

          {/* ===============================================
              OPTIONS
          =============================================== */}

          <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
            <div className="space-y-0.5">
              {USER_ROLE_OPTIONS.map((role) => {
                const Icon = ROLE_ICONS[role.value] ?? ShieldCheck;

                const selected = role.value === value;

                return (
                  <button
                    key={role.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => handleSelectRole(role)}
                    className={`
                        group
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-lg
                        px-2.5
                        py-2
                        text-left
                        transition-colors

                        ${selected ? "bg-gray-100" : "hover:bg-gray-50"}
                      `}
                  >
                    {/* ICON */}
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

                          ${
                            selected
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-500 group-hover:bg-gray-200/70 group-hover:text-gray-800"
                          }
                        `}
                    >
                      <Icon size={14} strokeWidth={1.6} />
                    </div>

                    {/* TEXT */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-semibold text-gray-900">
                        {role.label}
                      </p>

                      <p className="mt-0.5 truncate text-[8px] text-gray-400">
                        {role.description}
                      </p>
                    </div>

                    {/* CHECK */}
                    <div
                      className={`
                          flex
                          h-6
                          w-6
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          transition-all

                          ${
                            selected
                              ? "bg-black text-white"
                              : "border border-gray-200 bg-white text-transparent"
                          }
                        `}
                    >
                      <Check size={11} strokeWidth={2} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* =======================================================
     FIELD
  ======================================================= */

  return (
    <div>
      {/* LABEL */}
      <label className="mb-1.5 block text-[11px] font-medium text-gray-700">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {/* TRIGGER */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!open) {
            updatePosition();
          }

          setOpen((current) => !current);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
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

        {/* SELECTED ROLE */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold text-gray-900">
            {selectedRole.label}
          </p>

          <p className="mt-0.5 truncate text-[8px] text-gray-400">
            {selectedRole.description}
          </p>
        </div>

        {/* CHEVRON */}
        <ChevronDown
          size={14}
          strokeWidth={1.6}
          className={`shrink-0 text-gray-400 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* ERROR */}
      {error && <p className="mt-1.5 text-[10px] text-red-500">{error}</p>}

      {/* PORTAL */}
      {typeof document !== "undefined" && createPortal(dropdown, document.body)}
    </div>
  );
}

export default RoleSelect;
