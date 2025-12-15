type Priority = "low" | "medium" | "high";

interface PriorityBadgeProps {
  priority?: Priority | null | undefined;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  high: "bg-red-100 text-red-800 border-red-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  low: "bg-green-100 text-green-800 border-green-300",
};

const DEFAULT_PRIORITY: Priority = "low";

function isValidPriority(value: unknown): value is Priority {
  return value === "low" || value === "medium" || value === "high";
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  // Robust handling: validate and fallback to default
  const effectivePriority: Priority = isValidPriority(priority)
    ? priority
    : DEFAULT_PRIORITY;

  const priorityColorClass = PRIORITY_COLORS[effectivePriority];
  const displayText = effectivePriority.toUpperCase();

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${priorityColorClass}`}
    >
      {displayText}
    </span>
  );
}
