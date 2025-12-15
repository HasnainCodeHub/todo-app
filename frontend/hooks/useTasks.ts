import { useState, useEffect, useCallback } from "react";
import { Task, TaskFilters, TaskSort } from "@/lib/types";
import { fetchTasks } from "@/lib/api";

export function useTasks(filters?: TaskFilters, sort?: TaskSort) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTasks(filters, sort);
      setTasks(data);
    } catch (err: any) {
      let errorMessage = "Failed to load tasks";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err?.detail === 'string') {
        errorMessage = err.detail;
      } else if (err?.detail) {
        errorMessage = JSON.stringify(err.detail);
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const refetch = useCallback(() => {
    loadTasks();
  }, [loadTasks]);

  return { tasks, loading, error, refetch };
}