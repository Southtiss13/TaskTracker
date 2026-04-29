export function TaskEmptyState() {
  return (
    <div className="rounded-[2rem] border border-dashed border-[#977DFF]/25 bg-[linear-gradient(180deg,_#FFFFFF_0%,_#FAF7FD_100%)] px-6 py-14 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0600AB]/55">
        Empty list
      </p>
      <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[#00033D]">
        No tasks match your current filters
      </h3>
      <p className="mt-3 text-sm leading-6 text-[#00033D]/66">
        Create your first task or adjust the filters to see more of your work.
      </p>
    </div>
  );
}
