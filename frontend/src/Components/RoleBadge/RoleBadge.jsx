import { getRoleBadge } from "../../lib/roleUtils";

export default function RoleBadge({ role }) {
  const badge = getRoleBadge(role);

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-semibold ${badge.className}`}
    >
      {badge.text}
    </span>
  );
}
