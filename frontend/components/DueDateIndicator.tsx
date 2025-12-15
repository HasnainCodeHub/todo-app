import { Task } from "@/lib/types";

interface DueDateIndicatorProps {
  dueDate: Task["due_date"];
  completed: boolean;
}

export default function DueDateIndicator({
  dueDate,
  completed,
}: DueDateIndicatorProps) {
  if (!dueDate || completed) return null;

  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  const isOverdue = diffMs < 0;
  const isDueSoon = diffHours > 0 && diffHours <= 24;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-600">Due: {formatDate(due)}</span>
      {isOverdue && (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-500 text-white">
          OVERDUE
        </span>
      )}
      {isDueSoon && (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-yellow-500 text-white">
          DUE SOON
        </span>
      )}
    </div>
  );
}
