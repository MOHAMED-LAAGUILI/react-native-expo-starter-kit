import { useMemo } from "react";
import { useUniwind } from "uniwind";

export function useThemeColors() {
  const { theme } = useUniwind();

  const isDark = theme.startsWith("dark");

  return useMemo(
    () => ({
      isDark,
      icon: isDark ? "#fff" : "#000",
      text: isDark ? "#fff" : "#000",
      border: isDark ? "#3f3f46" : "#d4d4d8",
      background: isDark ? "#000" : "#fff",
    }),
    [isDark],
  );
}