"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

const THEME_KEY = "kawan-pendengar.theme";
type Theme = "light" | "dark";

function systemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const attr = document.documentElement.dataset.theme;
  if (attr === "light" || attr === "dark") return attr;
  return systemTheme();
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTheme(currentTheme());
    setReady(true);
  }, []);

  function toggle() {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      window.sessionStorage.setItem(THEME_KEY, next);
    } catch {
      // A blocked storage just means the choice lasts for this page.
    }
    setTheme(next);
  }

  const label = ready && theme === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap";

  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-label={label} title={label}>
      <Icon name={ready && theme === "dark" ? "sun" : "moon"} />
    </button>
  );
}
