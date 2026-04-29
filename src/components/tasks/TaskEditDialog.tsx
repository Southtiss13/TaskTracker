type TaskEditDialogProps = {
  task: {
    title: string;
  };
  form: {
    title: string;
    description: string;
    status: "todo" | "in_progress" | "done";
    priority: "low" | "medium" | "high";
    dueDate: string;
  };
  errors: {
    title?: string;
    dueDate?: string;
  };
  isSaving: boolean;
  apiError: string;
  statusOptions: Array<{ value: "todo" | "in_progress" | "done"; label: string }>;
  priorityOptions: Array<{ value: "low" | "medium" | "high"; label: string }>;
  onClose: () => void;
  onChange: (
    field: "title" | "description" | "status" | "priority" | "dueDate",
    value: string,
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function TaskEditDialog({
  task,
  form,
  errors,
  isSaving,
  apiError,
  statusOptions,
  priorityOptions,
  onClose,
  onChange,
  onSubmit,
}: TaskEditDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#00033D]/30 px-4 py-6 backdrop-blur-sm sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-task-title"
    >
      <div className="flex min-h-full items-center justify-center">
        <div className="w-full max-w-[min(42rem,calc(100vw-2rem))] rounded-[2rem] bg-white p-5 shadow-[0_32px_90px_rgba(0,3,61,0.20)] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0600AB]/60">
                Edit task
              </p>
              <h2
                id="edit-task-title"
                className="mt-2 text-2xl font-semibold tracking-tight text-[#00033D]"
              >
                Update {task.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-full border border-[#00033D]/10 px-3 py-2 text-sm font-medium text-[#00033D] transition hover:border-[#977DFF] hover:bg-[#F6F3FF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Close
            </button>
          </div>

          <form className="mt-6 space-y-5" onSubmit={onSubmit}>
            <div className="min-w-0 space-y-2">
              <label
                htmlFor="edit-title"
                className="text-sm font-medium text-[#00033D]"
              >
                Title
              </label>
              <input
                id="edit-title"
                value={form.title}
                onChange={(event) => onChange("title", event.target.value)}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? "edit-title-error" : undefined}
                className="w-full max-w-full min-w-0 rounded-2xl border border-[#00033D]/12 bg-[#F9F7FC] px-4 py-3 text-base outline-none transition focus:border-[#977DFF] focus:bg-white focus:ring-4 focus:ring-[#977DFF]/12"
              />
              {errors.title ? (
                <p id="edit-title-error" className="text-sm text-[#C13274]">
                  {errors.title}
                </p>
              ) : null}
            </div>

            <div className="min-w-0 space-y-2">
              <label
                htmlFor="edit-description"
                className="text-sm font-medium text-[#00033D]"
              >
                Description
              </label>
              <textarea
                id="edit-description"
                value={form.description}
                onChange={(event) => onChange("description", event.target.value)}
                rows={4}
                className="w-full max-w-full min-w-0 rounded-2xl border border-[#00033D]/12 bg-[#F9F7FC] px-4 py-3 text-base outline-none transition focus:border-[#977DFF] focus:bg-white focus:ring-4 focus:ring-[#977DFF]/12"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <label
                  htmlFor="edit-status"
                  className="text-sm font-medium text-[#00033D]"
                >
                  Status
                </label>
                <select
                  id="edit-status"
                  value={form.status}
                  onChange={(event) => onChange("status", event.target.value)}
                  className="w-full max-w-full min-w-0 rounded-2xl border border-[#00033D]/12 bg-[#F9F7FC] px-4 py-3 text-base outline-none transition focus:border-[#977DFF] focus:bg-white focus:ring-4 focus:ring-[#977DFF]/12"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0 space-y-2">
                <label
                  htmlFor="edit-priority"
                  className="text-sm font-medium text-[#00033D]"
                >
                  Priority
                </label>
                <select
                  id="edit-priority"
                  value={form.priority}
                  onChange={(event) => onChange("priority", event.target.value)}
                  className="w-full max-w-full min-w-0 rounded-2xl border border-[#00033D]/12 bg-[#F9F7FC] px-4 py-3 text-base outline-none transition focus:border-[#977DFF] focus:bg-white focus:ring-4 focus:ring-[#977DFF]/12"
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0 space-y-2 sm:col-span-2">
              <label
                htmlFor="edit-dueDate"
                className="text-sm font-medium text-[#00033D]"
                >
                  Due date
                </label>
              <input
                id="edit-dueDate"
                type="text"
                value={form.dueDate}
                onChange={(event) => onChange("dueDate", event.target.value)}
                inputMode="numeric"
                pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                placeholder="YYYY-MM-DD"
                aria-invalid={Boolean(errors.dueDate)}
                aria-describedby={errors.dueDate ? "edit-dueDate-error" : undefined}
                className="w-full max-w-full min-w-0 rounded-2xl border border-[#00033D]/12 bg-[#F9F7FC] px-4 py-3 text-base outline-none transition focus:border-[#977DFF] focus:bg-white focus:ring-4 focus:ring-[#977DFF]/12"
              />
              {errors.dueDate ? (
                <p id="edit-dueDate-error" className="text-sm text-[#C13274]">
                  {errors.dueDate}
                </p>
              ) : null}
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
                disabled={isSaving}
                className="rounded-2xl border border-[#00033D]/12 px-4 py-3 text-sm font-semibold text-[#00033D] transition hover:border-[#977DFF] hover:bg-[#F7F3FF] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-2xl bg-[#0600AB] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(6,0,171,0.22)] transition hover:bg-[#0033FF] disabled:cursor-not-allowed disabled:bg-[#A6A8D4] disabled:shadow-none"
              >
                {isSaving ? "Saving changes..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
