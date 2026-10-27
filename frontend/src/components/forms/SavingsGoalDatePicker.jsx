import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { CalendarDays, X } from "lucide-react";
import {
  getDaysInMonth,
  parseTargetDate,
  targetDateValue,
  updateTargetDateParts,
} from "../../utils/goalTargetDate";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_OPTIONS = MONTHS.map((label, index) => ({ value: index + 1, label }));
const ROW_HEIGHT = 40;

function DateWheel({ label, options, value, onChange }) {
  const id = useId();
  const scrollRef = useRef(null);
  const lastScrollValue = useRef(null);
  const selectedIndex = options.findIndex((option) => option.value === value);

  useLayoutEffect(() => {
    // Scroll gestures already moved the wheel. Only sync external changes,
    // such as keyboard selection or clamping January 31 to February 28.
    if (scrollRef.current && lastScrollValue.current !== value) {
      scrollRef.current.scrollTop = selectedIndex * ROW_HEIGHT;
    }
    lastScrollValue.current = value;
  }, [selectedIndex, value]);

  const selectIndex = (index) => {
    const next = options[Math.max(0, Math.min(options.length - 1, index))];
    onChange(next.value);
  };

  const handleKeyDown = (event) => {
    const offsets = { ArrowUp: -1, ArrowDown: 1, PageUp: -5, PageDown: 5 };
    if (event.key in offsets) {
      event.preventDefault();
      selectIndex(selectedIndex + offsets[event.key]);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      selectIndex(event.key === "Home" ? 0 : options.length - 1);
    }
  };

  return (
    <div
      ref={scrollRef}
      role="listbox"
      aria-label={label}
      aria-activedescendant={`${id}-${value}`}
      aria-orientation="vertical"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onScroll={(event) => {
        const index = Math.max(0, Math.min(
          options.length - 1,
          Math.round(event.currentTarget.scrollTop / ROW_HEIGHT),
        ));
        const next = options[index].value;
        lastScrollValue.current = next;
        if (next !== value) onChange(next);
      }}
      className="relative h-[280px] min-w-0 snap-y snap-mandatory overflow-y-auto overscroll-y-contain rounded-lg py-[120px] text-center outline-none [scrollbar-width:none] [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black [&::-webkit-scrollbar]:hidden"
    >
      {options.map((option, index) => (
        <div
          key={option.value}
          id={`${id}-${option.value}`}
          role="option"
          aria-selected={option.value === value}
          onClick={() => selectIndex(index)}
          className={`flex h-10 cursor-pointer snap-center items-center justify-center px-1 text-[13px] select-none sm:text-[14px] ${
            option.value === value ? "font-semibold text-black" : "text-gray-500"
          }`}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
}

function DatePickerContent({ value, onConfirm }) {
  const [today] = useState(() => new Date());
  const [draft, setDraft] = useState(() => parseTargetDate(value) || {
    year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate(),
  });
  const savedDate = parseTargetDate(value);
  const firstYear = Math.min(today.getFullYear() - 100, savedDate?.year ?? Infinity);
  const lastYear = Math.max(today.getFullYear() + 100, savedDate?.year ?? 0);
  const years = useMemo(() => Array.from(
    { length: lastYear - firstYear + 1 },
    (_, index) => ({ value: firstYear + index, label: String(firstYear + index) }),
  ), [firstYear, lastYear]);
  const days = useMemo(() => Array.from(
    { length: getDaysInMonth(draft.year, draft.month) },
    (_, index) => ({ value: index + 1, label: String(index + 1) }),
  ), [draft.year, draft.month]);

  const updatePart = (part, next) => {
    setDraft((current) => updateTargetDateParts(current, { [part]: next }));
  };

  return (
    <>
      <Dialog.Title className="sr-only">Select target date</Dialog.Title>
      <Dialog.Description className="sr-only">
        Scroll each column to choose a month, day, and year. With a keyboard,
        use the up and down arrow keys, then select your target date to confirm.
      </Dialog.Description>

      <div className="relative">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 h-10 -translate-y-1/2 rounded-lg bg-gray-100" />
        <div className="relative grid grid-cols-[1.35fr_0.8fr_1fr] gap-1">
          <DateWheel label="Month" options={MONTH_OPTIONS} value={draft.month} onChange={(next) => updatePart("month", next)} />
          <DateWheel label="Day" options={days} value={draft.day} onChange={(next) => updatePart("day", next)} />
          <DateWheel label="Year" options={years} value={draft.year} onChange={(next) => updatePart("year", next)} />
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        <button
          type="button"
          onClick={() => onConfirm(targetDateValue(draft))}
          className="flex min-h-11 w-full items-center justify-center rounded-full bg-black px-4 py-3 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2"
        >
          Select target date
        </button>
        <Dialog.Close type="button" className="flex min-h-11 w-full items-center justify-center rounded-full border border-gray-400 bg-white px-4 py-3 text-[13px] font-medium text-gray-800 transition-colors hover:border-black hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2">
          Cancel
        </Dialog.Close>
      </div>
    </>
  );
}

export default function SavingsGoalDatePicker({ value, onChange, disabled, open, onOpenChange }) {
  const labelId = useId();
  const selected = parseTargetDate(value);
  const displayDate = selected
    ? new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00`))
    : "Add";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <div role="group" aria-labelledby={labelId} className="flex min-w-0 items-center justify-between gap-3 border-y border-gray-100 py-3">
        <div id={labelId} className="min-w-0 text-[12px] font-medium text-gray-700">
          <span className="flex items-center gap-2">
            <CalendarDays aria-hidden="true" size={15} strokeWidth={1.6} />
            Target date
          </span>
          <span className="mt-1 block text-[11px] font-normal text-gray-500">Optional</span>
        </div>
        <div className="flex min-w-0 items-center gap-1">
          <Dialog.Trigger
            id="savings-goal-date"
            type="button"
            disabled={disabled}
            aria-label={selected ? `Change target date, ${displayDate}` : "Add target date"}
            className="min-h-11 rounded-full bg-gray-100 px-4 py-2 text-[12px] font-medium text-gray-950 transition-colors hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {displayDate}
          </Dialog.Trigger>
          {selected && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange("")}
              aria-label="Remove target date"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-black focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2 disabled:opacity-50"
            >
              <X aria-hidden="true" size={15} />
            </button>
          )}
        </div>
      </div>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[400] bg-black/55" />
        <Dialog.Popup className="fixed inset-x-3 bottom-0 z-[410] mx-auto max-h-[calc(100dvh-1rem)] max-w-[420px] overflow-y-auto overscroll-contain rounded-t-[24px] border border-gray-200 bg-white px-3 pt-5 pb-[max(16px,env(safe-area-inset-bottom))] shadow-xl outline-none sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-[420px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:p-6">
          <DatePickerContent value={value} onConfirm={(next) => {
            onChange(next);
            onOpenChange(false);
          }} />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
