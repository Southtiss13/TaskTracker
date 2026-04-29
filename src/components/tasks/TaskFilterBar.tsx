type TaskFilterBarProps = {
  searchQuery: string;
  statusFilter: "all" | "todo" | "in_progress" | "done";
  priorityFilter: "all" | "low" | "medium" | "high";
  statusOptions: Array<{
    value: "all" | "todo" | "in_progress" | "done";
    label: string;
  }>;
  priorityOptions: Array<{
    value: "all" | "low" | "medium" | "high";
    label: string;
  }>;
  selectedDateLabel?: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "all" | "todo" | "in_progress" | "done") => void;
  onPriorityChange: (value: "all" | "low" | "medium" | "high") => void;
  onReset: () => void;
  onClearSelectedDate: () => void;
};

export function TaskFilterBar({
  searchQuery,
  statusFilter,
  priorityFilter,
  statusOptions,
  priorityOptions,
  selectedDateLabel,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onReset,
  onClearSelectedDate,
}: TaskFilterBarProps) {
  return (
    <div className="rounded-[2rem] border border-[#977DFF]/12 bg-white p-6 shadow-[0_24px_60px_rgba(6,0,171,0.06)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0600AB]/60">
            Filters
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#00033D]">
            Narrow the list
          </h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full bg-[#F7F3FF] px-4 py-2 text-sm font-semibold text-[#0600AB] transition hover:bg-[#EEE8FF]"
        >
          Reset
        </button>
      </div>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="title-search"
            className="text-sm font-medium text-[#00033D]"
          >
            Search by title
          </label>
          <input
            id="title-search"
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search tasks"
            className="w-full rounded-2xl border border-[#00033D]/12 bg-[#F9F7FC] px-4 py-3 text-base outline-none transition focus:border-[#977DFF] focus:bg-white focus:ring-4 focus:ring-[#977DFF]/12"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <div className="space-y-2">
            <label
              htmlFor="status-filter"
              className="text-sm font-medium text-[#00033D]"
            >
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) =>
                onStatusChange(
                  event.target.value as "all" | "todo" | "in_progress" | "done",
                )
              }
              className="w-full rounded-2xl border border-[#00033D]/12 bg-[#F9F7FC] px-4 py-3 text-base outline-none transition focus:border-[#977DFF] focus:bg-white focus:ring-4 focus:ring-[#977DFF]/12"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="priority-filter"
              className="text-sm font-medium text-[#00033D]"
            >
              Priority
            </label>
            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(event) =>
                onPriorityChange(
                  event.target.value as "all" | "low" | "medium" | "high",
                )
              }
              className="w-full rounded-2xl border border-[#00033D]/12 bg-[#F9F7FC] px-4 py-3 text-base outline-none transition focus:border-[#977DFF] focus:bg-white focus:ring-4 focus:ring-[#977DFF]/12"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {selectedDateLabel ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F2E6EE] px-4 py-2 text-sm font-semibold text-[#00033D]">
            <span>Date: {selectedDateLabel}</span>
            <button
              type="button"
              onClick={onClearSelectedDate}
              className="rounded-full bg-white px-2 py-0.5 text-xs text-[#0600AB] transition hover:bg-[#EEE8FF]"
            >
              Clear
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
