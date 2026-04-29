"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { DayPicker, type DayButtonProps } from "react-day-picker";
import { z } from "zod";
import { TaskCard } from "@/src/components/tasks/TaskCard";
import { TaskCreateForm } from "@/src/components/tasks/TaskCreateForm";
import { TaskEditDialog } from "@/src/components/tasks/TaskEditDialog";
import { TaskEmptyState } from "@/src/components/tasks/TaskEmptyState";
import { TaskFilterBar } from "@/src/components/tasks/TaskFilterBar";
import { TaskHeader } from "@/src/components/tasks/TaskHeader";

type User = {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
};

type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type TaskFormValues = {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
};

type EditTaskFormValues = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
};

type TaskFormErrors = {
  title?: string;
  dueDate?: string;
};

const taskTitleSchema = z.string().trim().min(1, "Title is required").max(255);

const initialCreateForm: TaskFormValues = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
};

const statusOptions: Array<{ value: "all" | TaskStatus; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const priorityOptions: Array<{ value: "all" | TaskPriority; label: string }> = [
  { value: "all", label: "All priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const editStatusOptions: Array<{ value: TaskStatus; label: string }> = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const editPriorityOptions: Array<{ value: TaskPriority; label: string }> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const calendarMonthOptions = [
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

const calendarYearOptions = Array.from(
  { length: 16 },
  (_, index) => 2020 + index,
);

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

function isSameCalendarDay(
  value: string | null | undefined,
  selected: Date | undefined,
) {
  if (!value || !selected) return false;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return false;

  return (
    date.getFullYear() === selected.getFullYear() &&
    date.getMonth() === selected.getMonth() &&
    date.getDate() === selected.getDate()
  );
}

function getDateInputValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isValidDateInput(value: string) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return false;

  const [year, month, day] = value.split("-").map(Number);

  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
}

function getResponseErrorMessage(data: unknown, fallbackMessage: string) {
  if (typeof data === "object" && data !== null && "error" in data) {
    const error = data.error;

    if (typeof error === "string" && error.trim()) {
      return error;
    }
  }

  return fallbackMessage;
}

function getCalendarDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function CalendarPopoverDropdown({
  label,
  value,
  options,
  isOpen,
  maxHeightClassName,
  triggerClassName,
  menuWidth,
  onToggle,
  onSelect,
  onClose,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  isOpen: boolean;
  maxHeightClassName: string;
  triggerClassName?: string;
  menuWidth?: number;
  onToggle: () => void;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    function updatePosition() {
      const rect = buttonRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      const viewportPadding = 16;
      const width = Math.max(menuWidth ?? rect.width, 108);
      const maxLeft = Math.max(
        viewportPadding,
        window.innerWidth - width - viewportPadding,
      );
      const left = Math.min(Math.max(rect.left, viewportPadding), maxLeft);

      setMenuStyle({
        top: rect.bottom + 10,
        left,
        width,
      });
    }

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, menuWidth]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen, onClose]);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={onToggle}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={[
          "group relative flex h-11 min-w-0 items-center justify-between gap-3 rounded-2xl border px-4 text-left text-sm font-semibold text-[#00033D] shadow-[0_12px_28px_rgba(6,0,171,0.08)] outline-none transition",
          "bg-[linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(247,243,255,0.94)_100%)]",
          isOpen
            ? "border-[#977DFF]/45 ring-4 ring-[#977DFF]/15"
            : "border-[#977DFF]/20 hover:border-[#977DFF]/35 hover:bg-[#FCFAFF]",
          "focus-visible:border-[#977DFF] focus-visible:ring-4 focus-visible:ring-[#977DFF]/15",
          triggerClassName ?? "",
        ].join(" ")}
      >
        <span className="truncate">{selectedOption?.label ?? value}</span>
        <span
          aria-hidden="true"
          className={`shrink-0 text-xs text-[#0600AB]/70 transition group-hover:text-[#0600AB] ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {isOpen && menuStyle
        ? createPortal(
            <>
              <button
                type="button"
                aria-label={`Close ${label}`}
                onClick={onClose}
                className="fixed inset-0 z-[90] bg-transparent"
              />
              <div
                ref={menuRef}
                role="listbox"
                aria-label={label}
                className={`fixed z-[100] overflow-y-auto rounded-[1.35rem] border border-[#977DFF]/20 bg-[linear-gradient(180deg,_rgba(255,255,255,0.99)_0%,_rgba(247,243,255,0.97)_100%)] p-2 shadow-[0_24px_60px_rgba(6,0,171,0.18)] ${maxHeightClassName}`}
                style={{
                  top: menuStyle.top,
                  left: menuStyle.left,
                  width: menuStyle.width,
                }}
              >
                <div className="space-y-1">
                  {options.map((option) => {
                    const isSelected = option.value === value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onSelect(option.value);
                          onClose();
                        }}
                        className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                          isSelected
                            ? "bg-[#0600AB] text-white shadow-[0_12px_24px_rgba(6,0,171,0.18)]"
                            : "text-[#00033D]/82 hover:bg-[#F7F3FF] hover:text-[#00033D]"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>,
            document.body,
          )
        : null}
    </>
  );
}

function DeleteTaskDialog({
  task,
  isDeleting,
  deleteError,
  onCancel,
  onConfirm,
}: {
  task: Task;
  isDeleting: boolean;
  deleteError: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#00033D]/35 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-task-title"
    >
      <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-[0_32px_90px_rgba(0,3,61,0.22)] sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0600AB]/60">
          Delete action
        </p>
        <h2
          id="delete-task-title"
          className="mt-2 text-2xl font-semibold tracking-tight text-[#00033D]"
        >
          Delete task?
        </h2>
        <p className="mt-4 text-sm leading-7 text-[#00033D]/72">
          You are about to delete{" "}
          <span className="font-semibold text-[#00033D]">
            &quot;{task.title}&quot;
          </span>
          . This action cannot be undone.
        </p>

        {deleteError ? (
          <div className="mt-5 rounded-2xl border border-[#FFCFF2] bg-[#FFF4FB] px-4 py-3 text-sm text-[#9E1F61]">
            {deleteError}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-2xl border border-[#00033D]/12 px-4 py-3 text-sm font-semibold text-[#00033D] transition hover:border-[#977DFF] hover:bg-[#F7F3FF] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-2xl bg-[#00033D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0600AB] disabled:cursor-not-allowed disabled:bg-[#7D82A8]"
          >
            {isDeleting ? "Deleting..." : "Delete task"}
          </button>
        </div>
      </div>
    </div>
  );
}
function CalendarDayButton(
  props: DayButtonProps & {
    dueCountByDay: Map<string, number>;
    completedCountByDay: Map<string, number>;
  },
) {
  const date = props.day.date;
  const key = getCalendarDayKey(date);

  const dueCount = props.dueCountByDay.get(key) ?? 0;
  const completedCount = props.completedCountByDay.get(key) ?? 0;

  const isSelected = props.modifiers.selected;
  const isToday = props.modifiers.today;
  const isOutside = props.modifiers.outside;

  return (
    <button
      type="button"
      className={[
        "relative mx-auto flex h-14 w-12 flex-col items-center justify-center rounded-2xl text-sm font-semibold transition",
        "focus:outline-none focus:ring-4 focus:ring-[#977DFF]/20",
        isSelected
          ? "bg-[#0600AB] text-white shadow-[0_12px_28px_rgba(6,0,171,0.24)] hover:bg-[#0600AB]"
          : "bg-transparent text-[#00033D] hover:bg-[#F2E6EE]",
        isToday && !isSelected ? "ring-1 ring-[#977DFF]/40" : "",
        isOutside && !isSelected ? "text-[#00033D]/35" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={props.onClick}
      onKeyDown={props.onKeyDown}
      onBlur={props.onBlur}
      onFocus={props.onFocus}
      disabled={props.disabled}
      aria-label={props["aria-label"]}
    >
      <span className="leading-none">{date.getDate()}</span>

      {dueCount > 0 || completedCount > 0 ? (
        <span
          className={[
            "mt-1 flex items-center justify-center gap-1 text-[10px] font-bold leading-none",
            isSelected ? "text-white" : "text-[#00033D]",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {dueCount > 0 ? <span>📌{dueCount}</span> : null}
          {completedCount > 0 ? <span>✅{completedCount}</span> : null}
        </span>
      ) : (
        <span className="mt-1 h-3" aria-hidden="true" />
      )}
    </button>
  );
}
export default function TasksPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TaskPriority>(
    "all",
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [openCalendarDropdown, setOpenCalendarDropdown] = useState<
    "month" | "year" | null
  >(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] =
    useState<TaskFormValues>(initialCreateForm);
  const [createErrors, setCreateErrors] = useState<TaskFormErrors>({});
  const [createErrorMessage, setCreateErrorMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState<EditTaskFormValues | null>(null);
  const [editErrors, setEditErrors] = useState<TaskFormErrors>({});
  const [editErrorMessage, setEditErrorMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        const data = (await response.json().catch(() => null)) as {
          user?: User;
          error?: string;
        } | null;

        if (!response.ok || !data?.user) {
          if (isMounted) {
            setTasksError(
              getResponseErrorMessage(data, "Unable to load your account."),
            );
          }
          return;
        }

        if (isMounted) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("TASKS_AUTH_ERROR", error);

        if (isMounted) {
          setTasksError("Unable to load your account.");
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    }

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;

    async function loadTasks() {
      try {
        setTasksLoading(true);
        setTasksError("");

        const response = await fetch("/api/tasks", {
          method: "GET",
          cache: "no-store",
        });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        const data = (await response.json().catch(() => null)) as {
          tasks?: Task[];
          error?: string;
        } | null;

        if (!response.ok) {
          if (isMounted) {
            setTasksError(
              getResponseErrorMessage(data, "Unable to load tasks right now."),
            );
          }
          return;
        }

        if (isMounted) {
          setTasks(data?.tasks ?? []);
        }
      } catch (error) {
        console.error("TASKS_PAGE_LOAD_ERROR", error);

        if (isMounted) {
          setTasksError("Unable to load tasks right now.");
        }
      } finally {
        if (isMounted) {
          setTasksLoading(false);
        }
      }
    }

    void loadTasks();

    return () => {
      isMounted = false;
    };
  }, [refreshKey, router, user]);

  const resetEditDialog = useCallback(() => {
    setEditingTask(null);
    setEditForm(null);
    setEditErrors({});
    setEditErrorMessage("");
  }, []);

  const resetCreateDialog = useCallback(() => {
    setCreateForm(initialCreateForm);
    setCreateErrors({});
    setCreateErrorMessage("");
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (taskToDelete && !isDeleting) {
        setTaskToDelete(null);
        setDeleteError("");
        return;
      }

      if (editingTask && !isUpdating) {
        resetEditDialog();
        return;
      }

      if (isCreateDialogOpen && !isCreating) {
        setIsCreateDialogOpen(false);
        resetCreateDialog();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [
    editingTask,
    isCreateDialogOpen,
    isCreating,
    isDeleting,
    isUpdating,
    taskToDelete,
    resetEditDialog,
    resetCreateDialog,
  ]);

  function refreshTasks() {
    setRefreshKey((current) => current + 1);
  }

  function validateTitle(value: string) {
    const result = taskTitleSchema.safeParse(value);

    if (!result.success) {
      return result.error.issues[0]?.message ?? "Title is required";
    }

    return "";
  }

  function openCreateDialog() {
    resetCreateDialog();
    setIsCreateDialogOpen(true);
  }

  function closeCreateDialog() {
    if (isCreating) {
      return;
    }

    setIsCreateDialogOpen(false);
    resetCreateDialog();
  }

  function handleCreateChange(field: keyof TaskFormValues, value: string) {
    setCreateForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (field === "title" || field === "dueDate") {
      setCreateErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
    }

    setCreateErrorMessage("");
  }

  function openEditDialog(task: Task) {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      dueDate: getDateInputValue(task.dueDate),
    });
    setEditErrors({});
    setEditErrorMessage("");
  }

  function closeEditDialog() {
    if (isUpdating) {
      return;
    }

    resetEditDialog();
  }

  function handleEditChange(field: keyof EditTaskFormValues, value: string) {
    setEditForm((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current,
    );

    if (field === "title" || field === "dueDate") {
      setEditErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
    }

    setEditErrorMessage("");
  }

  async function handleCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const titleError = validateTitle(createForm.title);
    const dueDateError = isValidDateInput(createForm.dueDate)
      ? ""
      : "Use date format YYYY-MM-DD";

    if (titleError || dueDateError) {
      setCreateErrors({
        title: titleError || undefined,
        dueDate: dueDateError || undefined,
      });
      return;
    }

    try {
      setIsCreating(true);
      setCreateErrorMessage("");

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: createForm.title.trim(),
          description: createForm.description.trim() || undefined,
          priority: createForm.priority,
          dueDate: createForm.dueDate || undefined,
        }),
      });

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setCreateErrorMessage(
          getResponseErrorMessage(data, "Unable to create task right now."),
        );
        return;
      }

      setIsCreateDialogOpen(false);
      resetCreateDialog();
      refreshTasks();
    } catch (error) {
      console.error("TASKS_CREATE_ERROR", error);
      setCreateErrorMessage("Unable to create task right now.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleLogout() {
    try {
      setIsLoggingOut(true);

      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.replace("/login");
    } catch (error) {
      console.error("TASKS_LOGOUT_ERROR", error);
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  }

  async function handleUpdateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingTask || !editForm) {
      return;
    }

    const titleError = validateTitle(editForm.title);
    const dueDateError = isValidDateInput(editForm.dueDate)
      ? ""
      : "Use date format YYYY-MM-DD";

    if (titleError || dueDateError) {
      setEditErrors({
        title: titleError || undefined,
        dueDate: dueDateError || undefined,
      });
      return;
    }

    try {
      setIsUpdating(true);
      setEditErrorMessage("");

      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editForm.title.trim(),
          description: editForm.description.trim() || undefined,
          status: editForm.status,
          priority: editForm.priority,
          dueDate: editForm.dueDate || null,
        }),
      });

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setEditErrorMessage(
          getResponseErrorMessage(data, "Unable to update this task."),
        );
        return;
      }

      resetEditDialog();
      refreshTasks();
    } catch (error) {
      console.error("TASKS_UPDATE_ERROR", error);
      setEditErrorMessage("Unable to update this task.");
    } finally {
      setIsUpdating(false);
    }
  }

  function openDeleteDialog(task: Task) {
    setTaskToDelete(task);
    setDeleteError("");
  }

  function closeDeleteDialog() {
    if (isDeleting) {
      return;
    }

    setTaskToDelete(null);
    setDeleteError("");
  }

  async function handleDeleteTask() {
    if (!taskToDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError("");

      const response = await fetch(`/api/tasks/${taskToDelete.id}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setDeleteError(
          getResponseErrorMessage(data, "Unable to delete this task."),
        );
        return;
      }

      if (editingTask?.id === taskToDelete.id) {
        resetEditDialog();
      }

      setTaskToDelete(null);
      setDeleteError("");
      refreshTasks();
    } catch (error) {
      console.error("TASKS_DELETE_ERROR", error);
      setDeleteError("Unable to delete this task.");
    } finally {
      setIsDeleting(false);
    }
  }

  const totalTasks = tasks.length;
  const todoTasks = tasks.filter((task) => task.status === "todo").length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "in_progress",
  ).length;
  const completedTasks = tasks.filter((task) => task.status === "done").length;

  const dueCountByDay = useMemo(() => {
    const counts = new Map<string, number>();

    for (const task of tasks) {
      if (!task.dueDate) continue;

      const date = new Date(task.dueDate);
      if (Number.isNaN(date.getTime())) continue;

      const key = getCalendarDayKey(date);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return counts;
  }, [tasks]);

  const completedCountByDay = useMemo(() => {
    const counts = new Map<string, number>();

    for (const task of tasks) {
      if (!task.completedAt) continue;

      const date = new Date(task.completedAt);
      if (Number.isNaN(date.getTime())) continue;

      const key = getCalendarDayKey(date);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return counts;
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return tasks
      .filter((task) =>
        normalizedQuery
          ? task.title.toLowerCase().includes(normalizedQuery)
          : true,
      )
      .filter((task) =>
        statusFilter === "all" ? true : task.status === statusFilter,
      )
      .filter((task) =>
        priorityFilter === "all" ? true : task.priority === priorityFilter,
      )
      .filter((task) => {
        if (!selectedDate) {
          return true;
        }

        return (
          isSameCalendarDay(task.dueDate, selectedDate) ||
          isSameCalendarDay(task.completedAt, selectedDate) ||
          isSameCalendarDay(task.createdAt, selectedDate) ||
          isSameCalendarDay(task.updatedAt, selectedDate)
        );
      });
  }, [priorityFilter, searchQuery, selectedDate, statusFilter, tasks]);

  if (isCheckingAuth) {
    return (
      <main className="min-h-screen bg-white px-6 py-10 text-[#00033D] sm:px-8 lg:px-12">
        <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center rounded-[2.25rem] bg-[linear-gradient(160deg,_#F2E6EE_0%,_#FFFFFF_65%,_#EEF2FF_100%)] p-10 shadow-[0_24px_80px_rgba(6,0,171,0.08)]">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#0600AB]/60">
              TaskTracker
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              Loading your workspace
            </h1>
            <p className="mt-3 text-sm text-[#00033D]/66">
              Checking your session and preparing your tasks.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#00033D]">
      <div className="mx-auto max-w-7xl px-6 py-6 sm:px-8 lg:px-10 xl:px-12">
        <TaskHeader
          userDisplayName={user?.fullName || user?.email || ""}
          isLoggingOut={isLoggingOut}
          onLogout={handleLogout}
        />

        <section className="mt-8 grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="overflow-visible rounded-[2rem] border border-[#977DFF]/14 bg-[radial-gradient(circle_at_top_left,_rgba(255,207,242,0.46),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(0,51,255,0.10),_transparent_28%),linear-gradient(180deg,_#FFFFFF_0%,_#FAF7FD_100%)] p-6 shadow-[0_26px_70px_rgba(6,0,171,0.08)]">
              <div className="rounded-[1.7rem] border border-white/75 bg-white/55 p-5 backdrop-blur-sm">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#977DFF]/18 bg-white/72 px-3 py-1.5 shadow-[0_10px_24px_rgba(6,0,171,0.05)]">
                    <span className="h-2 w-2 rounded-full bg-[#977DFF]" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0600AB]/68">
                      Calendar
                    </p>
                  </div>
                  <h2 className="text-[1.75rem] font-semibold tracking-tight text-[#00033D]">
                    Browse task dates
                  </h2>
                  <p className="max-w-[28rem] text-sm leading-6 text-[#00033D]/64">
                    Select a day to filter tasks by due, completed, created, or
                    updated activity.
                  </p>
                </div>
                <div className="mt-6">
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCalendarMonth(
                          new Date(
                            calendarMonth.getFullYear(),
                            calendarMonth.getMonth() - 1,
                            1,
                          ),
                        )
                      }
                      className="px-2 py-2 text-lg font-semibold text-[#0600AB] hover:text-[#977DFF] transition"
                      aria-label="Previous month"
                    >
                      ‹
                    </button>

                    <div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-2xl border border-[#977DFF]/20 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(247,243,255,0.94)_100%)] shadow-[0_12px_28px_rgba(6,0,171,0.08)]">
                      <div className="grid min-w-0 grid-cols-[minmax(120px,1fr)_1px_96px] items-center">
                        <div className="min-w-0">
                          <CalendarPopoverDropdown
                            label="Select month"
                            value={String(calendarMonth.getMonth())}
                            options={calendarMonthOptions.map(
                              (month, index) => ({
                                value: String(index),
                                label: month,
                              }),
                            )}
                            isOpen={openCalendarDropdown === "month"}
                            maxHeightClassName="max-h-[260px]"
                            triggerClassName="h-11 w-full rounded-none border-0 bg-transparent px-3 text-sm font-semibold shadow-none hover:bg-[#F7F3FF] focus-visible:ring-2 focus-visible:ring-[#977DFF]/20 focus-visible:border-transparent"
                            onToggle={() =>
                              setOpenCalendarDropdown((current) =>
                                current === "month" ? null : "month",
                              )
                            }
                            onClose={() => setOpenCalendarDropdown(null)}
                            onSelect={(value) =>
                              setCalendarMonth(
                                new Date(
                                  calendarMonth.getFullYear(),
                                  Number(value),
                                  1,
                                ),
                              )
                            }
                          />
                        </div>

                        <div className="mx-auto h-6 w-px bg-[#977DFF]/22" />

                        <div className="min-w-0">
                          <CalendarPopoverDropdown
                            label="Select year"
                            value={String(calendarMonth.getFullYear())}
                            options={calendarYearOptions.map((year) => ({
                              value: String(year),
                              label: String(year),
                            }))}
                            isOpen={openCalendarDropdown === "year"}
                            maxHeightClassName="max-h-[260px]"
                            triggerClassName="h-11 w-full rounded-none border-0 bg-transparent px-4 text-sm font-semibold shadow-none hover:bg-[#F7F3FF] focus-visible:ring-2 focus-visible:ring-[#977DFF]/20 focus-visible:border-transparent"
                            onToggle={() =>
                              setOpenCalendarDropdown((current) =>
                                current === "year" ? null : "year",
                              )
                            }
                            onClose={() => setOpenCalendarDropdown(null)}
                            onSelect={(value) =>
                              setCalendarMonth(
                                new Date(
                                  Number(value),
                                  calendarMonth.getMonth(),
                                  1,
                                ),
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setCalendarMonth(
                          new Date(
                            calendarMonth.getFullYear(),
                            calendarMonth.getMonth() + 1,
                            1,
                          ),
                        )
                      }
                      className="px-2 py-2 text-lg font-semibold text-[#0600AB] hover:text-[#977DFF] transition"
                      aria-label="Next month"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-visible rounded-[1.85rem] border border-white/75 bg-[linear-gradient(180deg,_rgba(255,255,255,0.88)_0%,_rgba(246,241,252,0.9)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.76),0_18px_40px_rgba(6,0,171,0.06)] sm:p-5">
                <div className="rounded-[1.55rem] border border-[#977DFF]/12 bg-[linear-gradient(180deg,_rgba(255,255,255,0.95)_0%,_rgba(250,247,253,0.94)_100%)] px-3 py-4 sm:px-4">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    hideNavigation
                    captionLayout="label"
                    showOutsideDays
                    classNames={{
                      root: "w-full",
                      months: "w-full",
                      month: "w-full",
                      month_caption: "hidden",
                      caption_label: "hidden",
                      nav: "hidden",

                      month_grid: "w-full border-collapse",
                      weekdays: "grid grid-cols-7 gap-y-3",
                      weekday:
                        "text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[#0600AB]/58",

                      weeks: "mt-4 grid gap-y-3",
                      week: "grid grid-cols-7 items-center",
                      day: "flex h-16 items-center justify-center p-0",
                      day_button: "p-0",

                      selected: "",
                      today: "",
                      outside: "",
                      disabled: "opacity-40",
                    }}
                    components={{
                      DayButton: (props) => (
                        <CalendarDayButton
                          {...props}
                          dueCountByDay={dueCountByDay}
                          completedCountByDay={completedCountByDay}
                        />
                      ),
                    }}
                  />
                </div>

                <div className="mt-4 rounded-[1.35rem] border border-[#977DFF]/10 bg-white/68 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#00033D]/65">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0600AB]/52">
                      Legend
                    </span>
                    <span className="rounded-full border border-[#977DFF]/12 bg-[#F7F3FF] px-3 py-1.5">
                      📌 Due date
                    </span>
                    <span className="rounded-full border border-[#00033D]/8 bg-[#F2E6EE] px-3 py-1.5">
                      ✅ Completed
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <TaskFilterBar
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              priorityFilter={priorityFilter}
              statusOptions={statusOptions}
              priorityOptions={priorityOptions}
              selectedDateLabel={
                selectedDate
                  ? formatDate(selectedDate.toISOString())
                  : undefined
              }
              onSearchChange={setSearchQuery}
              onStatusChange={setStatusFilter}
              onPriorityChange={setPriorityFilter}
              onReset={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setPriorityFilter("all");
                setSelectedDate(undefined);
              }}
              onClearSelectedDate={() => setSelectedDate(undefined)}
            />
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[#977DFF]/12 bg-white p-6 shadow-[0_24px_60px_rgba(6,0,171,0.06)]">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0600AB]/60">
                    Task list
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#00033D]">
                    Your work in one view
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#00033D]/64">
                    Keep your current tasks visible, update them quickly, and
                    focus on what matters next.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openCreateDialog}
                  className="rounded-2xl bg-[#0600AB] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(6,0,171,0.22)] transition hover:bg-[#0033FF]"
                >
                  Create task
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                <div className="rounded-[1.5rem] bg-[#F2E6EE] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7A4160]">
                    Total
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[#00033D]">
                    {totalTasks}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-[#FFF1FA] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A14C83]">
                    To do
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[#00033D]">
                    {todoTasks}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-[#EEF2FF] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1C41D8]">
                    In progress
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[#00033D]">
                    {inProgressTasks}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-[#E8F8F2] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#177A56]">
                    Done
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[#00033D]">
                    {completedTasks}
                  </p>
                </div>
              </div>
            </div>

            {tasksError ? (
              <div className="rounded-[2rem] border border-[#FFCFF2] bg-[#FFF5FB] px-5 py-4 text-sm text-[#9E1F61] shadow-[0_18px_40px_rgba(255,207,242,0.20)]">
                {tasksError}
              </div>
            ) : null}

            <div className="rounded-[2rem] border border-[#977DFF]/12 bg-white p-6 shadow-[0_24px_60px_rgba(6,0,171,0.06)]">
              {tasksLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-[2rem] border border-[#977DFF]/10 bg-white p-6"
                    >
                      <div className="h-4 w-24 rounded-full bg-[#F2E6EE]" />
                      <div className="mt-4 h-7 w-2/3 rounded-full bg-[#ECE7F7]" />
                      <div className="mt-3 h-4 w-full rounded-full bg-[#F4F0FA]" />
                      <div className="mt-2 h-4 w-4/5 rounded-full bg-[#F4F0FA]" />
                      <div className="mt-5 flex gap-3">
                        <div className="h-8 w-24 rounded-full bg-[#ECE7F7]" />
                        <div className="h-8 w-24 rounded-full bg-[#ECE7F7]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredTasks.length === 0 ? (
                <TaskEmptyState />
              ) : (
                <div className="space-y-4">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => openEditDialog(task)}
                      onDelete={() => openDeleteDialog(task)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {isCreateDialogOpen ? (
        <TaskCreateForm
          form={createForm}
          errors={createErrors}
          apiError={createErrorMessage}
          isSubmitting={isCreating}
          priorityOptions={editPriorityOptions}
          onClose={closeCreateDialog}
          onChange={handleCreateChange}
          onSubmit={handleCreateTask}
        />
      ) : null}

      {editingTask && editForm ? (
        <TaskEditDialog
          task={editingTask}
          form={editForm}
          errors={editErrors}
          isSaving={isUpdating}
          apiError={editErrorMessage}
          statusOptions={editStatusOptions}
          priorityOptions={editPriorityOptions}
          onClose={closeEditDialog}
          onChange={handleEditChange}
          onSubmit={handleUpdateTask}
        />
      ) : null}

      {taskToDelete ? (
        <DeleteTaskDialog
          task={taskToDelete}
          isDeleting={isDeleting}
          deleteError={deleteError}
          onCancel={closeDeleteDialog}
          onConfirm={handleDeleteTask}
        />
      ) : null}
    </main>
  );
}
