"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultAdminLabels, type AdminLabels } from "@/lib/operational-labels";
import { cn } from "@/lib/utils";

type AdminTheme = "light" | "dark";

type AdminThemeContextValue = {
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
};

const adminThemeStorageKey = "supplierPassportAdminTheme";
const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>("light");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storedTheme = window.localStorage.getItem(adminThemeStorageKey);

      if (storedTheme === "dark" || storedTheme === "light") {
        setThemeState(storedTheme);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const value = useMemo<AdminThemeContextValue>(
    () => ({
      theme,
      setTheme: (nextTheme) => {
        setThemeState(nextTheme);
        window.localStorage.setItem(adminThemeStorageKey, nextTheme);
      },
    }),
    [theme],
  );

  return (
    <AdminThemeContext.Provider value={value}>
      <div
        data-admin-theme={theme}
        className={cn(
          "admin-workspace min-h-screen bg-slate-50 text-slate-950",
          theme === "dark" && "dark",
        )}
      >
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function AdminThemeToggle({
  labels = defaultAdminLabels,
}: {
  labels?: AdminLabels;
}) {
  const { theme, setTheme } = useAdminTheme();
  const isDark = theme === "dark";
  const nextTheme = isDark ? "light" : "dark";
  const label = isDark ? labels.lightMode : labels.darkMode;
  const ariaLabel = isDark ? labels.switchToLightMode : labels.switchToDarkMode;
  const Icon = isDark ? Sun : Moon;

  return (
    <Button
      type="button"
      variant="outline"
      className="admin-secondary-action rounded-xl bg-white"
      aria-label={ariaLabel}
      onClick={() => setTheme(nextTheme)}
    >
      <Icon data-icon="inline-start" />
      {label}
    </Button>
  );
}

function useAdminTheme() {
  const context = useContext(AdminThemeContext);

  if (!context) {
    throw new Error("AdminThemeToggle must be used inside AdminThemeProvider.");
  }

  return context;
}
