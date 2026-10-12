'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const Ctx = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  initialTheme = "light",
  onChange,
  children,
}: {
  initialTheme?: Theme;
  /** Called after the optimistic flip; throw to roll back (e.g. a failed persist request). */
  onChange?: (theme: Theme) => Promise<void>;
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const previous = theme;
    const next = previous === "light" ? "dark" : "light";
    setTheme(next);
    onChange?.(next).catch(() => setTheme(previous));
  };

  return <Ctx.Provider value={{ theme, toggleTheme }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
