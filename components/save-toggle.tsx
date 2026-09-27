"use client";

import { useState } from "react";

export function SaveToggle({ entity, id, initialSaved = false }: { entity: "colleges" | "courses"; id: string; initialSaved?: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function toggle() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/student/saved/${entity}/${id}`, { method: saved ? "DELETE" : "POST" });
      const result = await response.json();
      if (!response.ok) { setMessage(result.error ?? "Unable to update your shortlist."); return; }
      setSaved(!saved);
    } catch { setMessage("Unable to connect. Please try again."); }
    finally { setBusy(false); }
  }
  return <span className="save-toggle-wrap"><button className="button button-light button-small" onClick={toggle} disabled={busy}>{busy ? "Saving…" : saved ? "Saved ✓" : "Save for later +"}</button>{message && <small className="save-error">{message}</small>}</span>;
}
