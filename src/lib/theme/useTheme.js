import { useEffect, useMemo } from "react";
import { createTheme } from "./themeFactory";

/**
 * Applies the theme to <html> and keeps it in sync with the user's setting.
 * For "system" mode, also listens for OS preference changes.
 *
 * @param {"dark"|"light"|"system"} mode
 * @returns {{ mode, resolvedMode, tokens, C, G, R }}
 */
export function useApplyTheme(mode) {
  const theme = useMemo(() => createTheme(mode), [mode]);

  useEffect(() => {
    theme.apply();

    if (mode !== "system") return;

    // Re-apply when OS toggles dark/light while mode is "system"
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onOsChange = () => createTheme("system").apply();
    mq.addEventListener("change", onOsChange);
    return () => mq.removeEventListener("change", onOsChange);
  }, [mode, theme]);

  return theme;
}
