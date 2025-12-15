"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import TaskForm from "@/components/TaskForm";
import { useTaskMutations } from "@/hooks/useTaskMutations";
import { fetchTask } from "@/lib/api";
import { Task, TaskUpdate } from "@/lib/types";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";

function EditTaskContent() {
  const router = useRouter();
  const params = useParams();
  const taskId = parseInt(params.id as string);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { updateTask } = useTaskMutations();

  useEffect(() => {
    async function loadTask() {
      try {
        const data = await fetchTask(taskId);
        setTask(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load task");
      } finally {
        setLoading(false);
      }
    }

    if (taskId) {
      loadTask();
    }
  }, [taskId]);

  const handleSubmit = async (data: TaskUpdate) => {
    await updateTask(taskId, data);
    router.push("/dashboard");
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Header />
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Header />
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800 font-medium">Error loading task</p>
            <p className="text-red-600 text-sm mt-1">
              {error || "Task not found"}
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Header />
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Edit Task</h2>
          <p className="text-gray-600 mt-2">Update the details of your task</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <TaskForm
            initialData={task}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Update Task"
          />
        </div>
      </div>
    </div>
  );
}

export default function EditTaskPage() {
  return (
    <AuthGuard>
      <EditTaskContent />
    </AuthGuard>
  );
}
