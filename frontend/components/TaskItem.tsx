import { useState } from "react";
import { motion } from "framer-motion";
import { Task } from "@/lib/types";
import { Edit, Trash2 } from "lucide-react";
import DueDateIndicator from "./DueDateIndicator";
import PriorityBadge from "./PriorityBadge";
import Modal from "./ui/Modal";
import Link from "next/link";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}

const priorityColors: { [key: string]: string } = {
    high: 'from-red-500 to-orange-500',
    medium: 'from-yellow-500 to-amber-500',
    low: 'from-green-500 to-emerald-500',
}

export default function TaskItem({ task, onToggleComplete, onDelete }: TaskItemProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleToggle = async () => {
    setIsProcessing(true);
    await onToggleComplete(task.id, task.completed);
    setIsProcessing(false);
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    await onDelete(task.id);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="bg-bg-secondary p-4 rounded-lg border border-white/10 flex flex-col gap-4 transition-shadow hover:shadow-lg"
      >
        <div className="flex items-start gap-4">
            <div className={`w-1.5 flex-shrink-0 h-8 bg-gradient-to-b ${priorityColors[task.priority ?? 'low'] || priorityColors['low']} rounded-full`} />
            <div className="flex-grow">
              <h4 className={`font-semibold text-text-primary ${task.completed ? 'line-through text-opacity-50' : ''}`}>
                {task.title}
              </h4>
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2">
                <DueDateIndicator dueDate={task.due_date} completed={task.completed} />
                <PriorityBadge priority={task.priority} />
              </div>
            </div>
             <motion.button 
                whileTap={{scale: 0.95}}
                onClick={handleToggle} 
                disabled={isProcessing} 
                className={`flex-shrink-0 px-3 py-1 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
                    task.completed
                    ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
            >
                {task.completed ? "Completed" : "Mark as Complete"}
            </motion.button>
        </div>
        <div className="flex items-center justify-end gap-4 border-t border-white/10 pt-3">
             <Link href={`/tasks/${task.id}/edit`} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
                <Edit size={14}/> Edit
            </Link>
             <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 transition-colors">
                <Trash2 size={14}/> Delete
            </button>
        </div>
      </motion.div>
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} title="Confirm Deletion">
        <p>Are you sure you want to delete the task &ldquo;{task.title}&rdquo;?</p>
      </Modal>
    </>
  );
}
