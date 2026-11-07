"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "colorful";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("codemind-theme") as Theme | null;
      if (stored === "dark" || stored === "light" || stored === "colorful") {
        setThemeState(stored);
        document.documentElement.setAttribute("data-theme", stored);
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
      }
    } catch {
      document.documentElement.setAttribute("data-theme", "dark");
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("codemind-theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    } catch {
      // ignore local storage restrictions
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={mounted ? `theme-${theme}` : "theme-dark"}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

