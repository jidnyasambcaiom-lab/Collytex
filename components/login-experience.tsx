"use client";

import { useState } from "react";
import { AuthForm } from "@/components/auth-form";

const loginTypes = [
  { id: "STUDENT", title: "Student", description: "Explore your next step", icon: "✳" },
  { id: "COLLEGE", title: "College", description: "Manage your college profile", icon: "⌂" },
] as const;

type LoginType = (typeof loginTypes)[number]["id"];

export function LoginExperience() {
  const [loginType, setLoginType] = useState<LoginType>("STUDENT");
  const [showPassword, setShowPassword] = useState(false);
  const selected = loginTypes.find((item) => item.id === loginType)!;

  return (
    <>
      <div className="login-tabs" role="tablist" aria-label="Choose account type">
        {loginTypes.map((item) => (
          <button
            key={item.id}
            className={`login-tab${loginType === item.id ? " is-active" : ""}`}
            type="button"
            role="tab"
            aria-selected={loginType === item.id}
            onClick={() => setLoginType(item.id)}
          >
            <span className="login-tab-icon" aria-hidden="true">{item.icon}</span>
            <span className="login-tab-copy">
              <strong>{item.title}</strong>
              <small>{item.description}</small>
            </span>
          </button>
        ))}
      </div>
      <div className="login-form-heading">
        <span className="eyebrow">WELCOME BACK</span>
        <h2>{selected.title} login</h2>
        <p>Sign in to continue to your Collytex workspace.</p>
      </div>
      <AuthForm mode="login" loginType={loginType} showPassword={showPassword} onPasswordToggle={() => setShowPassword(!showPassword)} />
    </>
  );
}
