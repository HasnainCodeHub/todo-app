"use client";

import { useMemo, useCallback, useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { Plus, Zap, Shield, Clock, Users } from 'lucide-react';
import Link from 'next/link';
import { useTasks } from "@/hooks/useTasks";
import { useTaskMutations } from "@/hooks/useTaskMutations";
import TaskList from "@/components/TaskList";
import AuthGuard from "@/components/AuthGuard";
import PageWrapper from "@/components/global/PageWrapper";
import { fetchUserProfile } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

export default function DashboardPage() {
  const { tasks, loading, error: tasksError, refetch } = useTasks();
  const { completeTask, incompleteTask, deleteTask } = useTaskMutations();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
        setAuthenticated(isAuthenticated());
        if (isAuthenticated()) {
            fetchUserProfile().then(setUser).catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch user profile."));
        } else {
            setUser(null); // Clear user data on logout
        }
    };

    handleAuthChange(); // Initial check

    window.addEventListener("auth-storage-change", handleAuthChange);

    return () => {
      window.removeEventListener("auth-storage-change", handleAuthChange);
    };
  }, []);

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
        <div className="text-center my-8">
            {authenticated && user && (
                <h2 className="text-3xl font-bold text-text-primary">Welcome, {(user.full_name as string)?.split(' ')[0]}! 👋</h2>
            )}
        </div>
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
        {tasksError && <p className="text-red-400">Error: {tasksError}</p>}

        {!loading && !tasksError && (
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

        <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-text-primary mb-4">Why You'll Love Our Task Manager</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-text-secondary">
                <div className="flex flex-col items-center">
                    <Zap size={40} className="text-accent-primary mb-2"/>
                    <h4 className="font-semibold text-lg mb-1">Effortless Task Creation</h4>
                    <p className="text-sm">Quickly add tasks with a single click.</p>
                </div>
                <div className="flex flex-col items-center">
                    <Shield size={40} className="text-accent-primary mb-2"/>
                    <h4 className="font-semibold text-lg mb-1">Secure & Private</h4>
                    <p className="text-sm">Your data is protected with top-tier security.</p>
                </div>
                <div className="flex flex-col items-center">
                    <Clock size={40} className="text-accent-primary mb-2"/>
                    <h4 className="font-semibold text-lg mb-1">Stay Organized</h4>
                    <p className="text-sm">Track your progress with Todo and Done lists.</p>
                </div>
                <div className="flex flex-col items-center">
                    <Users size={40} className="text-accent-primary mb-2"/>
                    <h4 className="font-semibold text-lg mb-1">Collaborate (Coming Soon)</h4>
                    <p className="text-sm">Share tasks and projects with your team.</p>
                </div>
            </div>
            <p className="mt-8 text-lg font-semibold text-accent-secondary">"The secret of getting ahead is getting started." - Mark Twain</p>
        </div>
        </PageWrapper>
    </AuthGuard>
  );
}