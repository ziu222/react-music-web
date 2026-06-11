export const C = {
  400: "#fb923c",
  500: "#f97316",
  600: "#ea580c",
  700: "#c2410c",
  900: "#7c2d12",
};

export const G = {
  400: "#fbbf24",
  500: "#f59e0b",
  600: "#d97706",
};

export const R = {
  400: "#fb7185",
};

/* Surface/text đọc từ CSS variables (index.css) để theme mode hoạt động.
 * Fallback là giá trị dark hiện tại. */
export const BG = {
  base: "var(--bg-base, #0f0c0c)",
  card: "var(--bg-card, #181818)",
  el: "var(--bg-el, #1f1f1f)",
  menu: "var(--bg-menu, #282828)",
};

export const TEXT = {
  primary: "var(--text-primary, #ede5dd)",
  secondary: "var(--text-secondary, rgba(255,255,255,0.5))",
  tertiary: "var(--text-tertiary, rgba(255,255,255,0.3))",
  strong: "var(--text-strong, rgba(255,255,255,0.92))",
  mid: "var(--text-mid, rgba(255,255,255,0.7))",
};

export const OVERLAY = {
  1: "var(--overlay-1, rgba(255,255,255,0.07))",
  2: "var(--overlay-2, rgba(255,255,255,0.12))",
};

export const BORDER = "var(--border, rgba(255,255,255,0.08))";

export const GRADIENTS = {
  hero: `linear-gradient(135deg, #7c2d12, #c2410c, #f97316)`,
  sunset: `linear-gradient(135deg, #f97316, #fbbf24)`,
  rose: `linear-gradient(135deg, #e11d48, #fb7185)`,
};
