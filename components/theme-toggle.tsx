"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const themes = ["system", "light", "dark"] as const;
const subscribe = () => () => {};

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  const currentTheme = mounted ? themes.find((mode) => mode === theme) ?? "system" : "system";
  const nextTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];
  const Icon = currentTheme === "dark" ? Moon : currentTheme === "light" ? Sun : Monitor;

  return (
    <button
      className="theme-toggle neon-button"
      type="button"
      aria-label={mounted ? `Theme: ${currentTheme}. Switch to ${nextTheme} mode` : "Change color theme"}
      title={mounted ? `Theme: ${currentTheme} (click for ${nextTheme})` : "Change color theme"}
      disabled={!mounted}
      onClick={() => setTheme(nextTheme)}
    >
      <Icon aria-hidden="true" size={18} />
      <span>{mounted ? currentTheme : "theme"}</span>
    </button>
  );
}
