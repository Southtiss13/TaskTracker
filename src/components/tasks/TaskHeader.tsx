type TaskHeaderProps = {
  userDisplayName: string;
  isLoggingOut: boolean;
  onLogout: () => void;
};

export function TaskHeader({
  userDisplayName,
  isLoggingOut,
  onLogout,
}: TaskHeaderProps) {
  return (
    <section className="overflow-visible rounded-[2.25rem] bg-[radial-gradient(circle_at_top_left,_rgba(151,125,255,0.18),_transparent_30%),linear-gradient(160deg,_#F2E6EE_0%,_#FFFFFF_58%,_#EEF2FF_100%)] p-6 shadow-[0_24px_80px_rgba(6,0,171,0.08)] sm:p-8 lg:p-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#0600AB]/60">
            TaskTracker
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#00033D] sm:text-5xl">
            My Tasks
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#00033D]/68">
            Organize your tasks and track your progress.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="rounded-[1.75rem] bg-white/82 px-5 py-4 shadow-[0_18px_40px_rgba(6,0,171,0.08)] backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0600AB]/60">
              Signed in as
            </p>
            <p className="mt-2 text-sm font-medium text-[#00033D]">
              {userDisplayName}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="rounded-[1.5rem] border border-[#00033D]/12 bg-white px-5 py-4 text-sm font-semibold text-[#00033D] shadow-[0_18px_40px_rgba(6,0,171,0.08)] transition hover:border-[#977DFF] hover:bg-[#F7F3FF] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </section>
  );
}
