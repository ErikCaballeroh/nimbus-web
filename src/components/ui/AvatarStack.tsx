import { Avatar } from "./Avatar";

export type AvatarPerson = { id: string; name: string; color: string };

export function AvatarStack({ people, max = 4, size = 28 }: { people: AvatarPerson[]; max?: number; size?: number }) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((p) => (
        <Avatar key={p.id} name={p.name} color={p.color} size={size} />
      ))}
      {extra > 0 && (
        <span
          className="inline-flex items-center justify-center rounded-full bg-secondary text-secondary-foreground font-semibold ring-2 ring-card"
          style={{ width: size, height: size, fontSize: size * 0.36 }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
