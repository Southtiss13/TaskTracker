type TaskCreateFormProps = {
  form: {
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    dueDate: string;
  };
  errors: {
    title?: string;
  };
  apiError: string;
  isSubmitting: boolean;
  priorityOptions: Array<{ value: "low" | "medium" | "high"; label: string }>;
  onClose: () => void;
  onChange: (
    field: "title" | "description" | "priority" | "dueDate",
    value: string,
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function TaskCreateForm({
  form,
  errors,
  apiError,
  isSubmitting,
  priorityOptions,
  onClose,
  onChange,
  onSubmit,
}: TaskCreateFormProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#00033D]/30 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-task-title"
    >
      <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-[0_32px_90px_rgba(0,3,61,0.20)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0600AB]/60">
              Create task
            </p>
            <h2
              id="create-task-title"
              className="mt-2 text-2xl font-semibold tracking-tight text-[#00033D]"
            >
              Add something new
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full border border-[#00033D]/10 px-3 py-2 text-sm font-medium text-[#00033D] transition hover:border-[#977DFF] hover:bg-[#F6F3FF] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Close
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="create-title"
              className="text-sm font-medium text-[#00033D]"
            >
              Title
            </label>
            <input
              id="create-title"
              value={form.title}
              onChange={(event) => onChange("title", event.target.value)}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "create-title-error" : undefined}
              className="w-full rounded-2xl border border-[#00033D]/12 bg-[#F9F7FC] px-4 py-3 text-base outline-none transition focus:border-[#977DFF] focus:bg-white focus:ring-4 focus:ring-[#977DFF]/12"
              placeholder="Plan sprint review notes"
            />
            {errors.title ? (
              <p id="create-title-error" className="text-sm text-[#C13274]">
                {errors.title}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="create-description"
              className="text-sm font-medium text-[#00033D]"
            >
              Description
            </label>
            <textarea
              id="create-description"
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-[#00033D]/12 bg-[#F9F7FC] px-4 py-3 text-base outline-none transition focus:border-[#977DFF] focus:bg-white focus:ring-4 focus:ring-[#977DFF]/12"
              placeholder="Add a short note or next step."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="create-priority"
                className="text-sm font-medium text-[#00033D]"
              >
                Priority
              </label>
              <select
                id="create-priority"
                value={form.priority}
                onChange={(event) => onChange("priority", event.target.value)}
                className="w-full rounded-2xl border border-[#00033D]/12 bg-[#F9F7FC] px-4 py-3 text-base outline-none transition focus:border-[#977DFF] focus:bg-white focus:ring-4 focus:ring-[#977DFF]/12"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="create-dueDate"
                className="text-sm font-medium text-[#00033D]"
              >
                Due date
              </label>
              <input
                id="create-dueDate"
                type="date"
                value={form.dueDate}
                onChange={(event) => onChange("dueDate", event.target.value)}
                className="w-full rounded-2xl border border-[#00033D]/12 bg-[#F9F7FC] px-4 py-3 text-base outline-none transition focus:border-[#977DFF] focus:bg-white focus:ring-4 focus:ring-[#977DFF]/12"
              />
            </div>
          </div>

          {apiError ? (
            <div className="rounded-2xl border border-[#FFCFF2] bg-[#FFF4FB] px-4 py-3 text-sm text-[#9E1F61]">
              {apiError}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-2xl border border-[#00033D]/12 px-4 py-3 text-sm font-semibold text-[#00033D] transition hover:border-[#977DFF] hover:bg-[#F7F3FF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-[#0600AB] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(6,0,171,0.22)] transition hover:bg-[#0033FF] disabled:cursor-not-allowed disabled:bg-[#A6A8D4] disabled:shadow-none"
            >
              {isSubmitting ? "Creating task..." : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
