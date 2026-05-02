import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";

type TaskDateInputProps = {
  id: string;
  label: string;
  value: string;
  error?: string;
  errorId: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseInputDate(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return undefined;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return undefined;
  }

  return parsedDate;
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path d="M3 10h18" />
      <path d="M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function TaskDateInput({
  id,
  label,
  value,
  error,
  errorId,
  onChange,
  disabled = false,
  placeholder = "YYYY-MM-DD",
  className = "",
}: TaskDateInputProps) {
  const selectedDate = parseInputDate(value);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    selectedDate ?? new Date(),
  );
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDatePickerOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDatePickerOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDatePickerOpen]);

  const openDatePicker = () => {
    setVisibleMonth(selectedDate ?? new Date());
    setIsDatePickerOpen(true);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      return;
    }

    onChange(formatDateForInput(date));
    setIsDatePickerOpen(false);
  };

  const clearDate = () => {
    onChange("");
    setIsDatePickerOpen(false);
  };

  return (
    <div
      ref={datePickerRef}
      className={`relative min-w-0 space-y-2 ${className}`.trim()}
    >
      <label htmlFor={id} className="text-sm font-medium text-[#00033D]">
        {label}
      </label>
      <div className="flex w-full max-w-full min-w-0 gap-2">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          inputMode="numeric"
          pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="w-full max-w-full min-w-0 rounded-2xl border border-[#00033D]/12 bg-[#F9F7FC] px-4 py-3 text-base outline-none transition focus:border-[#977DFF] focus:bg-white focus:ring-4 focus:ring-[#977DFF]/12"
        />
        <button
          type="button"
          onClick={openDatePicker}
          disabled={disabled}
          aria-label="Open due date calendar"
          aria-expanded={isDatePickerOpen}
          aria-controls={`${id}-picker`}
          className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-2xl border border-[#00033D]/12 bg-white text-[#0600AB] transition hover:border-[#977DFF] hover:bg-[#F2E6EE] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#977DFF]/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CalendarIcon />
        </button>
      </div>
      {error ? (
        <p id={errorId} className="text-sm text-[#C13274]">
          {error}
        </p>
      ) : null}

      {isDatePickerOpen ? (
        <div
          id={`${id}-picker`}
          className="absolute left-0 right-0 top-full z-20 mt-2 max-w-full rounded-2xl border border-[#F2E6EE] bg-white p-3 shadow-[0_22px_55px_rgba(0,3,61,0.18)]"
        >
          <DayPicker
            mode="single"
            selected={selectedDate}
            month={visibleMonth}
            onMonthChange={setVisibleMonth}
            onSelect={handleDateSelect}
            showOutsideDays
            captionLayout="label"
            classNames={{
              root: "w-full max-w-full text-[#00033D]",
              months: "w-full max-w-full",
              month: "w-full max-w-full",
              month_caption:
                "flex items-center justify-center px-10 pb-3 text-sm font-semibold text-[#00033D]",
              caption_label: "truncate",
              nav: "absolute left-3 right-3 top-3 flex items-center justify-between",
              button_previous:
                "flex h-8 w-8 items-center justify-center rounded-full border border-[#F2E6EE] text-[#0600AB] transition hover:border-[#977DFF] hover:bg-[#F2E6EE]",
              button_next:
                "flex h-8 w-8 items-center justify-center rounded-full border border-[#F2E6EE] text-[#0600AB] transition hover:border-[#977DFF] hover:bg-[#F2E6EE]",
              chevron: "h-4 w-4 fill-[#0600AB]",
              month_grid: "w-full table-fixed border-collapse",
              weekdays: "border-b border-[#F2E6EE]",
              weekday:
                "px-0 pb-2 text-center text-[0.68rem] font-semibold uppercase text-[#00033D]/55",
              weeks: "",
              week: "",
              day: "p-0.5 text-center align-middle [&>button]:mx-auto",
              day_button:
                "flex h-9 w-9 max-w-full items-center justify-center rounded-full text-sm font-medium text-[#00033D] transition hover:bg-[#F2E6EE] focus:outline-none focus:ring-2 focus:ring-[#977DFF]/40",
              selected:
                "[&>button]:bg-[#0600AB] [&>button]:text-white [&>button]:hover:bg-[#0600AB]",
              today: "[&>button]:border [&>button]:border-[#977DFF]",
              outside: "[&>button]:text-[#00033D]/35",
              disabled: "opacity-40",
            }}
          />
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#F2E6EE] pt-3">
            <span className="min-w-0 truncate text-xs font-medium text-[#00033D]/60">
              {value || "No due date"}
            </span>
            <button
              type="button"
              onClick={clearDate}
              className="shrink-0 rounded-full border border-[#00033D]/12 px-3 py-1.5 text-xs font-semibold text-[#00033D] transition hover:border-[#977DFF] hover:bg-[#F2E6EE] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#977DFF]/20"
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
