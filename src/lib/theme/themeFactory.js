import { DARK_TOKENS, LIGHT_TOKENS } from "./themeTokens";

// Accent palette is the same across all themes (brand colors).
const ACCENT = {
  C: { 400: "#fb923c", 500: "#f97316", 600: "#ea580c", 700: "#c2410c", 900: "#7c2d12" },
  G: { 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706" },
  R: { 400: "#fb7185" },
};

function getSystemResolvedMode() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Factory function — creates a theme product from a mode key.
 *
 * @param {"dark"|"light"|"system"} mode
 * @returns {{ mode, resolvedMode, tokens, C, G, R, apply }}
 */
export function createTheme(mode) {
  const resolvedMode = mode === "system" ? getSystemResolvedMode() : mode;
  const tokens = resolvedMode === "light" ? LIGHT_TOKENS : DARK_TOKENS;

  return {
    mode,
    resolvedMode,
    tokens,
    ...ACCENT,
    /** Write all CSS variables to a DOM element (defaults to <html>). */
    apply(el = document.documentElement) {
      Object.entries(tokens).forEach(([prop, value]) => {
        el.style.setProperty(prop, value);
      });
    },
  };
}
