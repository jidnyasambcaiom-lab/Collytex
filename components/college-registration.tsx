"use client";

import { FormEvent, useState } from "react";

export function CollegeRegistration() {
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="registration-success" aria-live="polite">
        <span className="success-check" aria-hidden="true">✓</span>
        <span className="eyebrow">REGISTRATION COMPLETE</span>
        <h2>Registration Successful</h2>
        <p>Your registration preview is complete. No information was saved or sent to a server.</p>
        <button className="text-button" type="button" onClick={() => setSubmitted(false)}>
          Submit another registration
        </button>
      </section>
    );
  }

  return (
    <form className="college-registration-form" onSubmit={submit}>
      <div className="form-grid">
        <label>
          College or institution name
          <input autoComplete="organization" name="collegeName" placeholder="e.g. Northstar University" required />
        </label>
        <label>
          Your name
          <input autoComplete="name" name="contactName" placeholder="Full name" required />
        </label>
        <label>
          Work email
          <input autoComplete="email" name="email" placeholder="you@college.edu" required type="email" />
        </label>
        <label>
          City
          <input autoComplete="address-level2" name="city" placeholder="City, state" required />
        </label>
        <label className="form-grid-wide">
          Official website <span className="optional-label">Optional</span>
          <input autoComplete="url" name="website" placeholder="https://www.yourcollege.edu" type="url" />
        </label>
      </div>
      <p className="registration-note"><span aria-hidden="true">✦</span> This is a preview. Your details stay in this browser and are not submitted.</p>
      <button className="button neon-button registration-submit" type="submit">
        Complete registration <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
