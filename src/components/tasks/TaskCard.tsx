type TaskCardProps = {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: "todo" | "in_progress" | "done";
    priority: "low" | "medium" | "high";
    dueDate: string | null;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  onEdit: () => void;
  onDelete: () => void;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "No date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getStatusBadgeClass(status: "todo" | "in_progress" | "done") {
  switch (status) {
    case "todo":
      return "bg-[#F2E6EE] text-[#7A4160]";
    case "in_progress":
      return "bg-[#E8EBFF] text-[#1C41D8]";
    case "done":
      return "bg-[#E8F8F2] text-[#177A56]";
  }
}

function getPriorityBadgeClass(priority: "low" | "medium" | "high") {
  switch (priority) {
    case "low":
      return "bg-[#F5F4FF] text-[#5E52A6]";
    case "medium":
      return "bg-[#FFF1FA] text-[#A14C83]";
    case "high":
      return "bg-[#EEF2FF] text-[#0600AB]";
  }
}

function TaskMetaItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-[1.5rem] bg-[#FAF7FD] px-4 py-3">
      <dt className="font-semibold text-[#0600AB]/70">{label}</dt>
      <dd className="mt-1">{formatDate(value)}</dd>
    </div>
  );
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <article className="rounded-[2rem] border border-[#977DFF]/12 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-[0_28px_70px_rgba(6,0,171,0.09)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusBadgeClass(task.status)}`}
            >
              {task.status === "in_progress" ? "In progress" : task.status}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getPriorityBadgeClass(task.priority)}`}
            >
              {task.priority} priority
            </span>
          </div>

          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[#00033D]">
            {task.title}
          </h3>

          <p className="mt-3 text-sm leading-7 text-[#00033D]/70">
            {task.description?.trim()
              ? task.description
              : "No description added yet."}
          </p>

          <dl className="mt-5 grid gap-3 text-sm text-[#00033D]/68 sm:grid-cols-2 xl:grid-cols-4">
            <TaskMetaItem label="Due date" value={task.dueDate} />
            <TaskMetaItem label="Completed" value={task.completedAt} />
            <TaskMetaItem label="Created" value={task.createdAt} />
            <TaskMetaItem label="Updated" value={task.updatedAt} />
          </dl>
        </div>

        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-2xl border border-[#00033D]/12 px-4 py-3 text-sm font-semibold text-[#00033D] transition hover:border-[#977DFF] hover:bg-[#F7F3FF]"
          >
            Edit task
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-2xl bg-[#00033D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0600AB]"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
