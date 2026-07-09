declare module "uniwind" {
  import type { ThemeName } from "uniwind/dist/module/core/types";

  export const Uniwind: {
    updateCSSVariables(
      arg0: string,
      light:
        | {
            readonly "--color-chart-1": "oklch(0.546 0.245 262.881)";
            readonly "--color-primary": "oklch(0.546 0.245 262.881)";
            readonly "--color-primary-foreground": "oklch(0.985 0 0)";
            readonly "--color-ring": "oklch(0.546 0.245 262.881)";
            readonly "--color-sidebar-primary": "oklch(0.546 0.245 262.881)";
            readonly "--color-sidebar-primary-foreground": "oklch(0.985 0 0)";
          }
        | {
            readonly "--color-chart-1": "oklch(0.558 0.288 302.321)";
            readonly "--color-primary": "oklch(0.558 0.288 302.321)";
            readonly "--color-primary-foreground": "oklch(0.985 0 0)";
            readonly "--color-ring": "oklch(0.558 0.288 302.321)";
            readonly "--color-sidebar-primary": "oklch(0.558 0.288 302.321)";
            readonly "--color-sidebar-primary-foreground": "oklch(0.985 0 0)";
          }
        | {
            readonly "--color-chart-1": "oklch(0.527 0.154 150.069)";
            readonly "--color-primary": "oklch(0.527 0.154 150.069)";
            readonly "--color-primary-foreground": "oklch(0.985 0 0)";
            readonly "--color-ring": "oklch(0.527 0.154 150.069)";
            readonly "--color-sidebar-primary": "oklch(0.527 0.154 150.069)";
            readonly "--color-sidebar-primary-foreground": "oklch(0.985 0 0)";
          }
        | {
            readonly "--color-chart-1": "oklch(0.646 0.222 41.116)";
            readonly "--color-primary": "oklch(0.646 0.222 41.116)";
            readonly "--color-primary-foreground": "oklch(0.985 0 0)";
            readonly "--color-ring": "oklch(0.646 0.222 41.116)";
            readonly "--color-sidebar-primary": "oklch(0.646 0.222 41.116)";
            readonly "--color-sidebar-primary-foreground": "oklch(0.985 0 0)";
          }
        | {
            readonly "--color-chart-1": "oklch(0.577 0.245 27.325)";
            readonly "--color-primary": "oklch(0.577 0.245 27.325)";
            readonly "--color-primary-foreground": "oklch(0.985 0 0)";
            readonly "--color-ring": "oklch(0.577 0.245 27.325)";
            readonly "--color-sidebar-primary": "oklch(0.577 0.245 27.325)";
            readonly "--color-sidebar-primary-foreground": "oklch(0.985 0 0)";
          }
        | {
            readonly "--color-chart-1": "oklch(0.6 0.118 184.704)";
            readonly "--color-primary": "oklch(0.6 0.118 184.704)";
            readonly "--color-primary-foreground": "oklch(0.985 0 0)";
            readonly "--color-ring": "oklch(0.6 0.118 184.704)";
            readonly "--color-sidebar-primary": "oklch(0.6 0.118 184.704)";
            readonly "--color-sidebar-primary-foreground": "oklch(0.985 0 0)";
          }
        | {
            readonly "--color-chart-1": "oklch(0.592 0.249 0.584)";
            readonly "--color-primary": "oklch(0.592 0.249 0.584)";
            readonly "--color-primary-foreground": "oklch(0.985 0 0)";
            readonly "--color-ring": "oklch(0.592 0.249 0.584)";
            readonly "--color-sidebar-primary": "oklch(0.592 0.249 0.584)";
            readonly "--color-sidebar-primary-foreground": "oklch(0.985 0 0)";
          }
    ): unknown;
    setTheme(theme: ThemeName | "system"): void;
    readonly currentTheme: ThemeName;
    readonly hasAdaptiveThemes: boolean;
    readonly themes: ThemeName[];
  };

  export function useUniwind(): {
    theme: ThemeName;
    hasAdaptiveThemes: boolean;
  };
}
