"use client";

import { useState } from "react";
import Link from "next/link";
import { Task } from "@/lib/types";
import PriorityBadge from "./PriorityBadge";
import TagList from "./TagList";
import DueDateIndicator from "./DueDateIndicator";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}

export default function TaskItem({
  task,
  onToggleComplete,
  onDelete,
}: TaskItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggle = async () => {
    setIsProcessing(true);
    try {
      await onToggleComplete(task.id, task.completed);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await onDelete(task.id);
    } finally {
      setIsProcessing(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggle}
          disabled={isProcessing}
          className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`text-lg font-medium ${
                task.completed ? "line-through opacity-50" : ""
              }`}
            >
              {task.title}
            </h3>
            <div className="flex gap-2 flex-shrink-0">
              <PriorityBadge priority={task.priority || "low"} />
            </div>
          </div>

          {task.description && (
            <p
              className={`mt-1 text-sm text-gray-600 ${
                task.completed ? "opacity-50" : ""
              }`}
            >
              {task.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <TagList tags={task.tags} />
            <DueDateIndicator dueDate={task.due_date} completed={task.completed} />
            {task.recurrence !== "none" && (
              <span className="text-xs text-gray-500">
                Recurs: {task.recurrence}
              </span>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <Link
              href={`/tasks/${task.id}/edit`}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Edit
            </Link>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isProcessing}
                className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
              >
                Delete
              </button>
            ) : (
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-600">Delete this task?</span>
                <button
                  onClick={handleDelete}
                  disabled={isProcessing}
                  className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isProcessing}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
