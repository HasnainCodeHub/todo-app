"use client";

import { Task } from "@/lib/types";
import TaskItem from "./TaskItem";
import { AnimatePresence } from "framer-motion";

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}

export default function TaskList({
  tasks,
  onToggleComplete,
  onDelete,
}: TaskListProps) {

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">No tasks here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
        <AnimatePresence>
            {tasks.map((task) => (
                <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                />
            ))}
        </AnimatePresence>
    </div>
  );
}
