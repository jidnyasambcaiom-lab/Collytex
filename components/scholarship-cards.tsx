type ScholarshipCardItem = {
  id: string;
  title: string;
  provider: string;
  amount: string;
  deadline: Date;
  applyUrl: string;
};

export function ScholarshipCards({ scholarships }: { scholarships: ScholarshipCardItem[] }) {
  if (scholarships.length === 0) {
    return <p className="rounded-xl border border-slate-200 bg-white p-5 text-slate-600">No scholarships match your marks right now.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {scholarships.map((scholarship) => (
        <article key={scholarship.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">{scholarship.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{scholarship.provider}</p>
          <p className="mt-4 font-medium text-slate-900">{scholarship.amount}</p>
          <p className="mt-2 text-sm text-slate-600">
            Deadline: {scholarship.deadline.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          <a
            className="mt-4 inline-flex rounded-lg bg-sky-700 px-4 py-2 font-medium text-white hover:bg-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
            href={scholarship.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Apply
          </a>
        </article>
      ))}
    </div>
  );
}
