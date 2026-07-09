import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from "expo-router/react-navigation";
import * as React from "react";
import { useColorScheme } from "react-native";
import { Uniwind } from "uniwind";
import { COLOR_PALETTES } from "@/config/color-palettes";
import { useThemeStore } from "@/store/themeStore";

function buildNavTheme(currentTheme: "light" | "dark", primaryColor: string) {
  const palette = COLOR_PALETTES.find(p => p.key === primaryColor);
  const primaryHex = palette?.color ?? "#3b82f6";
  const base = currentTheme === "dark" ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: primaryHex,
    },
  };
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useThemeStore(s => s.mode);
  const primaryColor = useThemeStore(s => s.primaryColor);
  const systemScheme = useColorScheme();

  const currentTheme = React.useMemo<"light" | "dark">(
    () => (themeMode === "system" ? (systemScheme === "dark" ? "dark" : "light") : themeMode),
    [themeMode, systemScheme]
  );

  React.useEffect(() => {
    Uniwind.setTheme(themeMode);
  }, [themeMode, systemScheme]);

  React.useEffect(() => {
    const palette = COLOR_PALETTES.find(p => p.key === primaryColor);
    if (!palette) return;
    Uniwind.updateCSSVariables("light", palette.light);
    Uniwind.updateCSSVariables("dark", palette.dark);
  }, [primaryColor]);

  const navTheme = React.useMemo(() => buildNavTheme(currentTheme, primaryColor), [currentTheme, primaryColor]);

  return <NavThemeProvider value={navTheme}>{children}</NavThemeProvider>;
}

export { ThemeProvider };
