"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { loginUser, signupUser } from "@/app/actions/auth";

export function AuthForm({
  mode,
  accountType = "STUDENT",
  loginType,
  showPassword = false,
  onPasswordToggle = () => {},
}: {
  mode: "login" | "register";
  accountType?: "STUDENT" | "COLLEGE_HEAD";
  loginType?: "STUDENT" | "COLLEGE" | "ADMIN";
  showPassword?: boolean;
  onPasswordToggle?: () => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      if (mode === "login") {
        const result = await loginUser(String(values.identity ?? ""), String(values.password ?? ""), loginType);
        if (!result.success) { setError(result.error); return; }
        router.push(result.redirect);
        router.refresh();
        return;
      }
      if (accountType === "STUDENT") {
        const result = await signupUser(new FormData(event.currentTarget));
        if (!result.success) { setError(result.error); return; }
        router.push(result.redirect);
        router.refresh();
        return;
      }
      const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, accountType }) });
      const result = await response.json();
      if (!response.ok) { setError(result.error ?? "Unable to continue. Please try again."); return; }
      router.push(result.redirectTo ?? "/account");
      router.refresh();
    } catch { setError("Unable to connect. Please try again."); }
    finally { setBusy(false); }
  }

  return <form className="auth-form" onSubmit={submit}>
    {mode === "register" && <label>Your name<input name="name" autoComplete="name" minLength={2} maxLength={100} required /></label>}
    {mode === "register" && <label>Username<input name="username" autoComplete="username" minLength={3} maxLength={32} pattern="[A-Za-z0-9._-]+" title="Use 3–32 letters, numbers, dots, underscores, or hyphens." required /></label>}
    {accountType === "COLLEGE_HEAD" && mode === "register" && <label>College or organization name<input name="collegeName" autoComplete="organization" minLength={2} maxLength={160} required /></label>}
    <label>{mode === "login" ? "Username or Email" : "Email address"}<input name={mode === "login" ? "identity" : "email"} type={mode === "login" ? "text" : "email"} autoComplete={mode === "login" ? "username" : "email"} maxLength={254} required /></label>
    <label className="password-label">
      <span>Password</span>
      <div className="password-input-wrapper">
        <input name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "register" ? 12 : 1} maxLength={128} required />
        <button type="button" className="password-toggle" onClick={onPasswordToggle} aria-label={showPassword ? "Hide password" : "Show password"}>
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {mode === "register" && <small>Use at least 12 characters.</small>}
    </label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-dark auth-submit" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}<span aria-hidden="true">→</span></button>
    {mode === "login" && loginType === "STUDENT" && <a href="/explore" className="guest-login-link">Continue as Guest</a>}
  </form>;
}
