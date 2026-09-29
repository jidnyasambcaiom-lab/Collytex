"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { updateStudentMarks } from "@/app/actions/scholarships";

export function StudentMarksForm({ userId, marks }: { userId: string; marks: number | null }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await updateStudentMarks(userId, Number(form.get("marks")));
      if (!result.success) {
        setError(result.error);
      } else {
        router.refresh();
      }
    } catch {
      setError("Unable to save your marks. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="mb-5 flex flex-wrap items-end gap-3" onSubmit={submit}>
      <label className="grid gap-1 text-sm font-medium text-slate-700">
        Previous semester marks (%)
        <input
          className="w-48 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
          type="number"
          name="marks"
          min="0"
          max="100"
          step="0.01"
          defaultValue={marks ?? ""}
          required
        />
      </label>
      <button className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-60" disabled={busy}>
        {busy ? "Saving…" : "Save marks"}
      </button>
      {error && <p className="basis-full text-sm text-red-700" role="alert">{error}</p>}
    </form>
  );
}
