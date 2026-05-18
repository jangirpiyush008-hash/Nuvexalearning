export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// Radii locked from the design spec: r-card 16 · r-btn 12 · r-sheet 24
export const Radii = {
  sm: 8,
  btn: 12,
  md: 12,    // alias kept for back-compat
  card: 16,
  lg: 16,    // alias
  sheet: 24,
  xl: 24,    // alias
  pill: 999,
} as const;
