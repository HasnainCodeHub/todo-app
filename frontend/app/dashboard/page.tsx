"use client";

import { useMemo, useCallback } from "react";
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useTasks } from "@/hooks/useTasks";
import { useTaskMutations } from "@/hooks/useTaskMutations";
import TaskList from "@/components/TaskList";
import AuthGuard from "@/components/AuthGuard";
import PageWrapper from "@/components/global/PageWrapper";

export default function DashboardPage() {
  const { tasks, loading, error, refetch } = useTasks();
  const { completeTask, incompleteTask, deleteTask } = useTaskMutations();

  const handleToggleComplete = useCallback(async (id: number, completed: boolean) => {
    await (completed ? incompleteTask(id) : completeTask(id));
    refetch();
  }, [completeTask, incompleteTask, refetch]);

  const handleDelete = useCallback(async (id: number) => {
    await deleteTask(id);
    refetch();
  }, [deleteTask, refetch]);

  const todoTasks = useMemo(() => tasks?.filter(t => !t.completed) || [], [tasks]);
  const doneTasks = useMemo(() => tasks?.filter(t => t.completed) || [], [tasks]);

  return (
    <AuthGuard>
        <PageWrapper>
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-text-primary">Tasks</h1>
            <Link href="/tasks/new">
                <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-primary to-accent-secondary text-black rounded-md font-semibold"
                >
                    <Plus size={20}/> New Task
                </motion.button>
            </Link>
        </div>
        
        {loading && <p className="text-text-secondary">Loading tasks...</p>}
        {error && <p className="text-red-400">Error: {error}</p>}

        {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 1: Todo */}
                <div className="bg-black/20 p-4 rounded-lg">
                    <h3 className="font-bold text-xl text-center mb-6 text-text-primary">Todo ({todoTasks.length})</h3>
                    <TaskList
                        tasks={todoTasks}
                        onToggleComplete={handleToggleComplete}
                        onDelete={handleDelete}
                    />
                </div>
                {/* Column 2: Done */}
                <div className="bg-black/20 p-4 rounded-lg">
                    <h3 className="font-bold text-xl text-center mb-6 text-text-primary">Done ({doneTasks.length})</h3>
                    <TaskList
                        tasks={doneTasks}
                        onToggleComplete={handleToggleComplete}
                        onDelete={handleDelete}
                    />
                </div>
            </div>
        )}
        </PageWrapper>
    </AuthGuard>
  );
}