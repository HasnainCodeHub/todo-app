"use client";

import { useCallback, useState } from 'react';
import { createTask as apiCreateTask, updateTask as apiUpdateTask, deleteTask as apiDeleteTask } from '@/lib/api'; 
import { TaskCreate, TaskUpdate, Task } from '@/lib/types';

export function useTaskMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performMutation = useCallback(async <T>(
    mutationFn: () => Promise<T>,
    errorMessage: string
  ): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      return await mutationFn();
    } catch (err) {
      const msg = err instanceof Error ? err.message : errorMessage;
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback((data: TaskCreate): Promise<Task> => 
    performMutation(() => apiCreateTask(data), "Failed to create task"), 
    [performMutation]
  );

  const updateTask = useCallback((id: number, data: TaskUpdate): Promise<Task> => 
    performMutation(() => apiUpdateTask(id, data), "Failed to update task"), 
    [performMutation]
  );

  const deleteTask = useCallback((id: number): Promise<void> => 
    performMutation(() => apiDeleteTask(id), "Failed to delete task"), 
    [performMutation]
  );

  const completeTask = useCallback((id: number): Promise<Task> => 
    performMutation(() => apiUpdateTask(id, { completed: true }), "Failed to complete task"), 
    [performMutation]
  );

  const incompleteTask = useCallback((id: number): Promise<Task> => 
    performMutation(() => apiUpdateTask(id, { completed: false }), "Failed to mark task incomplete"), 
    [performMutation]
  );

  return { createTask, updateTask, deleteTask, completeTask, incompleteTask, loading, error };
}