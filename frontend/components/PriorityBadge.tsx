import { Task } from "@/lib/types";

interface PriorityBadgeProps {
  priority?: Task["priority"]; // Make priority optional
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  // Provide a default priority if it's undefined or null
  const effectivePriority = priority || "low"; 

  const colors = {
    high: "bg-red-100 text-red-800 border-red-300",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
    low: "bg-green-100 text-green-800 border-green-300",
  };

  // Safely access colors using effectivePriority
  const priorityColorClass = colors[effectivePriority] || colors.low; // Fallback to 'low' color if effectivePriority somehow doesn't match

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${priorityColorClass}`}
    >
      {effectivePriority.toUpperCase()}
    </span>
  );
}
