"use client";

import { useState } from "react";

export function PresentationCollegeActions() {
  const [saved, setSaved] = useState(false);
  const [compared, setCompared] = useState(false);

  return (
    <div className="profile-action-row">
      <button className="button button-light button-small" type="button" aria-pressed={saved} onClick={() => setSaved(!saved)}>
        {saved ? "Saved ✓" : "Save for later +"}
      </button>
      <button className="button button-light button-small" type="button" aria-pressed={compared} onClick={() => setCompared(!compared)}>
        {compared ? "Added to compare ✓" : "Add to compare"}
      </button>
    </div>
  );
}
