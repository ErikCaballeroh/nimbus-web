export function Progress({ value, color = "var(--primary)" }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}
