export function tooltipStyle(theme: string) {
  return {
    background: theme === "dark" ? "#1a1d23" : "#fff",
    border: `1px solid ${theme === "dark" ? "#262a31" : "#e6e8ec"}`,
    borderRadius: 10,
    fontSize: 12,
    boxShadow: "0 8px 24px -8px rgb(16 24 40 / 0.2)",
    color: theme === "dark" ? "#e7e9ee" : "#1a1d21",
  };
}

export function chartColors(theme: string) {
  return {
    grid: theme === "dark" ? "#262a31" : "#e6e8ec",
    axis: theme === "dark" ? "#8b909a" : "#6b7280",
  };
}
