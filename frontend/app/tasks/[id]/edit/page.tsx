"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import TaskForm from "@/components/TaskForm";
import { useTaskMutations } from "@/hooks/useTaskMutations";
import { fetchTask } from "@/lib/api";
import { Task, TaskUpdate } from "@/lib/types";
import AuthGuard from "@/components/AuthGuard";
import PageWrapper from "@/components/global/PageWrapper";


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
        // Redirect if task is completed - completed tasks cannot be edited
        if (data.completed) {
          router.push("/dashboard");
          return;
        }
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
  }, [taskId, router]);

  const handleSubmit = async (data: TaskUpdate) => {
    await updateTask(taskId, data);
    router.push("/dashboard");
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
          <p className="mt-2 text-text-secondary">Loading task...</p>
        </div>
      </PageWrapper>
    );
  }

  if (error || !task) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-center">
            <p className="text-red-400 font-medium">Error loading task</p>
            <p className="text-red-300 text-sm mt-1">
              {error || "Task not found"}
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-4 px-4 py-2 bg-accent-primary text-black rounded-lg hover:bg-accent-secondary font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-text-primary">Edit Task</h2>
          <p className="text-text-secondary mt-2">Update the details of your task</p>
        </div>

        <div className="bg-bg-secondary rounded-lg shadow-lg border border-white/10 p-6">
          <TaskForm
            initialData={task}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Update Task"
          />
        </div>
      </div>
    </PageWrapper>
  );
}

export default function EditTaskPage() {
  return (
    <AuthGuard>
      <EditTaskContent />
    </AuthGuard>
  );
}
