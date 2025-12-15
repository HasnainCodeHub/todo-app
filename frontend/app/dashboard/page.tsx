"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { TaskFilters, TaskSort, Task } from "@/lib/types";
import { useTasks } from "@/hooks/useTasks";
import { useTaskMutations } from "@/hooks/useTaskMutations";
import TaskList from "@/components/TaskList";
import SearchBar from "@/components/SearchBar";
import FilterControls from "@/components/FilterControls";
import SortControls from "@/components/SortControls";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";

function DashboardContent() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<TaskFilters>({});
  const [sort, setSort] = useState<TaskSort>({ sort_by: "created_at", sort_order: "desc" });

  const activeFilters = useMemo(() => ({ ...filters, search: search || undefined }), [filters, search]);

  const { tasks, loading, error, refetch } = useTasks(activeFilters, sort);
  const { completeTask, incompleteTask, deleteTask } = useTaskMutations();

  const handleToggleComplete = useCallback(async (id: number, completed: boolean) => {
    try {
      await (completed ? incompleteTask(id) : completeTask(id));
      refetch();
    } catch (err) {
      console.error("Failed to toggle task completion:", err);
    }
  }, [completeTask, incompleteTask, refetch]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteTask(id);
      refetch();
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  }, [deleteTask, refetch]);

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    if (tasks) {
      tasks.forEach((task: any) => {
        if (task.tags) {
          task.tags.forEach((tag: string) => tagSet.add(tag));
        }
      });
    }
    return Array.from(tagSet).sort();
  }, [tasks]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Header />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex-1 max-w-md">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <Link
            href="/tasks/new"
            className="ml-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium inline-flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Add Task
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <FilterControls
            filters={filters}
            onChange={setFilters}
            availableTags={availableTags}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sort</h2>
          <SortControls sort={sort} onChange={setSort} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Tasks ({tasks?.length || 0})
            </h2>
            {!loading && (
              <button
                onClick={() => refetch()}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Refresh
              </button>
            )}
          </div>
          <TaskList
            tasks={tasks || []}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            loading={loading}
            error={error || null}
          />
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}