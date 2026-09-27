"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export type FormField = { name: string; label: string; type?: "text" | "email" | "password" | "number"; required?: boolean; minLength?: number; maxLength?: number; step?: string; value?: string };

export function ManagementForm({ endpoint, fields, hidden = {}, submitText, method = "POST" }: { endpoint: string; fields: FormField[]; hidden?: Record<string, string>; submitText: string; method?: "POST" | "PUT" }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSuccess(""); setBusy(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const body: Record<string, string | number> = { ...hidden };
    for (const field of fields) {
      const value = String(form.get(field.name) ?? "").trim();
      if (!value && !field.required) continue;
      body[field.name] = field.type === "number" && value ? Number(value) : value;
    }
    try {
      const response = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) { setError(result.error ?? "Unable to save. Please try again."); return; }
      setSuccess("Saved."); formElement.reset(); router.refresh();
    } catch { setError("Unable to connect. Please try again."); }
    finally { setBusy(false); }
  }

  return <form className="management-form" onSubmit={submit}>{fields.map((field) => <label key={field.name}>{field.label}<input name={field.name} type={field.type ?? "text"} required={field.required ?? true} minLength={field.minLength} maxLength={field.maxLength} step={field.step} defaultValue={field.value} /></label>)}{error && <p className="form-error" role="alert">{error}</p>}{success && <p className="form-success" role="status">{success}</p>}<button className="button button-dark" disabled={busy}>{busy ? "Saving…" : submitText}</button></form>;
}

export function BranchApproval({ branchId, approved }: { branchId: string; approved: boolean }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function update(approved: boolean) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/college/branches/${branchId}/approval`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ approved }) });
      const result = await response.json();
      if (!response.ok) { setMessage(result.error ?? "Unable to update status."); return; }
      router.refresh();
    } catch { setMessage("Unable to connect."); }
    finally { setBusy(false); }
  }
  return <div className="approval-control"><button className="button button-light button-small" disabled={busy} onClick={() => update(!approved)}>{approved ? "Pause public listing" : "Approve campus"}</button>{message && <span className="form-error">{message}</span>}</div>;
}
