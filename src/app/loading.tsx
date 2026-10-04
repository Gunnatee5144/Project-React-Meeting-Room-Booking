export default function Loading() {
  return (
    <div
      className="workspace-page mx-auto max-w-7xl px-5 sm:px-8"
      role="status"
      aria-label="กำลังโหลดข้อมูล"
    >
      <span className="sr-only">กำลังโหลดข้อมูล</span>
      <div aria-hidden="true" className="loading-skeleton space-y-8">
        <div className="h-3 w-24 rounded-full bg-blue-100" />
        <div className="h-9 w-72 max-w-full rounded-lg bg-slate-100" />
        <div className="h-4 w-96 max-w-full rounded-full bg-slate-100" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl border border-slate-200"
            >
              <div className="aspect-video bg-slate-100" />
              <div className="p-6 space-y-4">
                <div className="h-5 w-4/5 rounded-md bg-slate-100" />
                <div className="h-3 w-1/2 rounded-md bg-slate-100" />
                <div className="h-11 rounded-xl bg-blue-50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
