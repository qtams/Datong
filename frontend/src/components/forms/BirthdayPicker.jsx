import { useEffect, useMemo, useRef, useState } from "react";

import { createPortal } from "react-dom";

import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

/* =========================================================
   CONFIG
========================================================= */

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MIN_YEAR = 1900;

const CALENDAR_WIDTH = 320;
const CALENDAR_HEIGHT = 390;
const GAP = 8;
const VIEWPORT_PADDING = 12;

/* =========================================================
   HELPERS
========================================================= */

function pad(value) {
  return String(value).padStart(2, "0");
}

function dateToValue(date) {
  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1,
  )}-${pad(date.getDate())}`;
}

function parseValue(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function isSameDate(first, second) {
  if (!first || !second) {
    return false;
  }

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function formatDisplayDate(value) {
  const date = parseValue(value);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();

  const days = [];

  /*
   * Fixed 42-cell layout.
   * Prevents calendar height from
   * jumping between months.
   */
  for (let index = 0; index < 42; index += 1) {
    const day = index - firstDay + 1;

    const date = new Date(year, month, day);

    days.push({
      date,

      currentMonth: date.getMonth() === month,
    });
  }

  return days;
}

/* =========================================================
   BIRTHDAY PICKER
========================================================= */

function BirthdayPicker({
  value,
  onChange,
  error,
  label = "Birthday",
  required = true,
}) {
  const triggerRef = useRef(null);

  const calendarRef = useRef(null);

  const today = useMemo(() => {
    const date = new Date();

    date.setHours(0, 0, 0, 0);

    return date;
  }, []);

  const selectedDate = useMemo(() => parseValue(value), [value]);

  const [open, setOpen] = useState(false);

  const [viewYear, setViewYear] = useState(
    selectedDate?.getFullYear() ?? today.getFullYear(),
  );

  const [viewMonth, setViewMonth] = useState(
    selectedDate?.getMonth() ?? today.getMonth(),
  );

  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: CALENDAR_WIDTH,
    placement: "bottom",
  });

  /* =======================================================
     YEARS
  ======================================================= */

  const years = useMemo(() => {
    const result = [];

    for (let year = today.getFullYear(); year >= MIN_YEAR; year -= 1) {
      result.push(year);
    }

    return result;
  }, [today]);

  /* =======================================================
     DAYS
  ======================================================= */

  const calendarDays = useMemo(
    () => getCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  /* =======================================================
     SYNC SELECTED DATE
  ======================================================= */

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    setViewYear(selectedDate.getFullYear());

    setViewMonth(selectedDate.getMonth());
  }, [selectedDate]);

  /* =======================================================
     CALCULATE POPOVER POSITION
  ======================================================= */

  const updatePosition = () => {
    if (!triggerRef.current) {
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();

    const viewportWidth = window.innerWidth;

    const viewportHeight = window.innerHeight;

    const width = Math.min(
      CALENDAR_WIDTH,
      viewportWidth - VIEWPORT_PADDING * 2,
    );

    const spaceBelow = viewportHeight - rect.bottom;

    const spaceAbove = rect.top;

    /*
     * Prefer opening below.
     * Open above only when there
     * is not enough space below.
     */
    const placement =
      spaceBelow >= CALENDAR_HEIGHT + GAP || spaceBelow >= spaceAbove
        ? "bottom"
        : "top";

    let top;

    if (placement === "bottom") {
      top = rect.bottom + GAP;

      /*
       * Last collision guard.
       */
      if (top + CALENDAR_HEIGHT > viewportHeight - VIEWPORT_PADDING) {
        top = Math.max(
          VIEWPORT_PADDING,
          viewportHeight - CALENDAR_HEIGHT - VIEWPORT_PADDING,
        );
      }
    } else {
      top = rect.top - CALENDAR_HEIGHT - GAP;

      if (top < VIEWPORT_PADDING) {
        top = VIEWPORT_PADDING;
      }
    }

    let left = rect.left;

    /*
     * Prevent right-side overflow.
     */
    if (left + width > viewportWidth - VIEWPORT_PADDING) {
      left = viewportWidth - width - VIEWPORT_PADDING;
    }

    /*
     * Prevent left-side overflow.
     */
    if (left < VIEWPORT_PADDING) {
      left = VIEWPORT_PADDING;
    }

    setPosition({
      top,
      left,
      width,
      placement,
    });
  };

  /* =======================================================
     OPEN POSITION
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    updatePosition();

    const handlePositionUpdate = () => {
      updatePosition();
    };

    window.addEventListener("resize", handlePositionUpdate);

    /*
     * Capture mode also catches
     * scrolling inside ModalShell.
     */
    window.addEventListener("scroll", handlePositionUpdate, true);

    return () => {
      window.removeEventListener("resize", handlePositionUpdate);

      window.removeEventListener("scroll", handlePositionUpdate, true);
    };
  }, [open]);

  /* =======================================================
     OUTSIDE CLICK
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      const clickedTrigger = triggerRef.current?.contains(event.target);

      const clickedCalendar = calendarRef.current?.contains(event.target);

      if (!clickedTrigger && !clickedCalendar) {
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

     Capture prevents ModalShell
     from also closing immediately.
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

      triggerRef.current?.focus();
    };

    document.addEventListener("keydown", handleEscape, true);

    return () => {
      document.removeEventListener("keydown", handleEscape, true);
    };
  }, [open]);

  /* =======================================================
     PREVIOUS MONTH
  ======================================================= */

  const handlePreviousMonth = () => {
    if (viewMonth === 0) {
      if (viewYear <= MIN_YEAR) {
        return;
      }

      setViewYear((current) => current - 1);

      setViewMonth(11);

      return;
    }

    setViewMonth((current) => current - 1);
  };

  /* =======================================================
     NEXT MONTH
  ======================================================= */

  const nextMonthDate = new Date(viewYear, viewMonth + 1, 1);

  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const canGoNext = nextMonthDate <= currentMonthStart;

  const handleNextMonth = () => {
    if (!canGoNext) {
      return;
    }

    if (viewMonth === 11) {
      setViewYear((current) => current + 1);

      setViewMonth(0);

      return;
    }

    setViewMonth((current) => current + 1);
  };

  /* =======================================================
     CHANGE MONTH
  ======================================================= */

  const handleMonthChange = (event) => {
    const month = Number(event.target.value);

    /*
     * Current year cannot select a
     * future month.
     */
    if (viewYear === today.getFullYear() && month > today.getMonth()) {
      return;
    }

    setViewMonth(month);
  };

  /* =======================================================
     CHANGE YEAR
  ======================================================= */

  const handleYearChange = (event) => {
    const year = Number(event.target.value);

    setViewYear(year);

    /*
     * When changing to current year,
     * prevent remaining on a future month.
     */
    if (year === today.getFullYear() && viewMonth > today.getMonth()) {
      setViewMonth(today.getMonth());
    }
  };

  /* =======================================================
     SELECT DATE
  ======================================================= */

  const handleSelectDate = (date) => {
    if (date > today || date.getFullYear() < MIN_YEAR) {
      return;
    }

    onChange?.(dateToValue(date));

    setOpen(false);

    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  };

  /* =======================================================
     CLEAR
  ======================================================= */

  const handleClear = () => {
    onChange?.("");

    setOpen(false);
  };

  /* =======================================================
     CALENDAR UI
  ======================================================= */

  const calendar = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={calendarRef}
          role="dialog"
          aria-label="Choose birthday"
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
          }}
          className="
            z-[9999]
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-[0_24px_80px_rgba(0,0,0,0.22)]
          "
        >
          {/* ===============================================
              TOP
          =============================================== */}

          <div className="border-b border-gray-100 px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              {/* PREVIOUS */}
              <button
                type="button"
                onClick={handlePreviousMonth}
                disabled={viewYear === MIN_YEAR && viewMonth === 0}
                aria-label="Previous month"
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  text-gray-500
                  transition-colors
                  hover:bg-gray-100
                  hover:text-gray-900
                  disabled:cursor-not-allowed
                  disabled:opacity-25
                "
              >
                <ChevronLeft size={15} strokeWidth={1.7} />
              </button>

              {/* MONTH / YEAR */}
              <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
                {/* MONTH */}
                <div className="relative">
                  <select
                    aria-label="Month"
                    value={viewMonth}
                    onChange={handleMonthChange}
                    className="
                      h-8
                      appearance-none
                      rounded-lg
                      border
                      border-transparent
                      bg-gray-50
                      pl-2.5
                      pr-7
                      text-[11px]
                      font-semibold
                      text-gray-800
                      outline-none
                      transition-colors
                      hover:bg-gray-100
                      focus:border-gray-200
                    "
                  >
                    {MONTHS.map((month, index) => {
                      const future =
                        viewYear === today.getFullYear() &&
                        index > today.getMonth();

                      return (
                        <option key={month} value={index} disabled={future}>
                          {month}
                        </option>
                      );
                    })}
                  </select>

                  <ChevronDown
                    size={11}
                    strokeWidth={1.7}
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>

                {/* YEAR */}
                <div className="relative">
                  <select
                    aria-label="Year"
                    value={viewYear}
                    onChange={handleYearChange}
                    className="
                      h-8
                      appearance-none
                      rounded-lg
                      border
                      border-transparent
                      bg-gray-50
                      pl-2.5
                      pr-7
                      text-[11px]
                      font-semibold
                      text-gray-800
                      outline-none
                      transition-colors
                      hover:bg-gray-100
                      focus:border-gray-200
                    "
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={11}
                    strokeWidth={1.7}
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>

              {/* NEXT */}
              <button
                type="button"
                onClick={handleNextMonth}
                disabled={!canGoNext}
                aria-label="Next month"
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  text-gray-500
                  transition-colors
                  hover:bg-gray-100
                  hover:text-gray-900
                  disabled:cursor-not-allowed
                  disabled:opacity-25
                "
              >
                <ChevronRight size={15} strokeWidth={1.7} />
              </button>
            </div>
          </div>

          {/* ===============================================
              BODY
          =============================================== */}

          <div className="p-3">
            {/* WEEKDAYS */}
            <div className="mb-1 grid grid-cols-7">
              {WEEKDAYS.map((weekday) => (
                <div
                  key={weekday}
                  className="flex h-7 items-center justify-center text-[8px] font-semibold uppercase tracking-[0.07em] text-gray-400"
                >
                  {weekday}
                </div>
              ))}
            </div>

            {/* DAYS */}
            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((item, index) => {
                const disabled =
                  item.date > today || item.date.getFullYear() < MIN_YEAR;

                const selected = isSameDate(item.date, selectedDate);

                const isToday = isSameDate(item.date, today);

                return (
                  <button
                    key={`${dateToValue(item.date)}-${index}`}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelectDate(item.date)}
                    aria-label={item.date.toLocaleDateString("en-PH", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    aria-pressed={selected}
                    className={`
                        relative
                        flex
                        h-9
                        items-center
                        justify-center
                        rounded-lg
                        text-[10px]
                        font-medium
                        transition-all
                        duration-100

                        ${
                          selected
                            ? "bg-black text-white shadow-sm"
                            : disabled
                              ? "cursor-not-allowed text-gray-200"
                              : item.currentMonth
                                ? "text-gray-700 hover:bg-gray-100 hover:text-black"
                                : "text-gray-300 hover:bg-gray-50 hover:text-gray-500"
                        }
                      `}
                  >
                    {item.date.getDate()}

                    {isToday && !selected && (
                      <span className="absolute bottom-[4px] h-[3px] w-[3px] rounded-full bg-black" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ===============================================
              FOOTER
          =============================================== */}

          <div className="flex h-[48px] items-center justify-between border-t border-gray-100 bg-gray-50/60 px-3">
            {value ? (
              <div className="min-w-0">
                <p className="text-[8px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                  Selected birthday
                </p>

                <p className="mt-0.5 truncate text-[10px] font-medium text-gray-700">
                  {formatDisplayDate(value)}
                </p>
              </div>
            ) : (
              <p className="text-[9px] text-gray-400">Choose a birthday</p>
            )}

            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-[9px] font-medium text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-800"
              >
                <X size={10} strokeWidth={1.6} />
                Clear
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative">
      {/* ===================================================
          LABEL
      =================================================== */}

      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-[11px] font-medium text-gray-700">
          {label}

          {required && <span className="ml-1 text-red-500">*</span>}
        </label>

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[9px] font-medium text-gray-400 transition-colors hover:text-gray-800"
          >
            Clear
          </button>
        )}
      </div>

      {/* ===================================================
          TRIGGER
      =================================================== */}

      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!open) {
            updatePosition();
          }

          setOpen((current) => !current);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`
          group
          flex
          h-11
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
        <CalendarDays
          size={15}
          strokeWidth={1.5}
          className={`
            shrink-0
            transition-colors

            ${
              open ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"
            }
          `}
        />

        <span
          className={`min-w-0 flex-1 truncate text-[12px] ${
            value ? "font-medium text-gray-900" : "font-normal text-gray-400"
          }`}
        >
          {value ? formatDisplayDate(value) : "Select birthday"}
        </span>

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

      {/* ===================================================
          PORTAL

          This is the important fix.
          Calendar is rendered outside ModalShell overflow.
      =================================================== */}

      {typeof document !== "undefined" && createPortal(calendar, document.body)}
    </div>
  );
}

export default BirthdayPicker;
