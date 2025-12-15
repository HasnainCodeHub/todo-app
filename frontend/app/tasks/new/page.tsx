"use client";

import { useRouter } from "next/navigation";
import TaskForm from "@/components/TaskForm";
import { useTaskMutations } from "@/hooks/useTaskMutations";
import { TaskCreate } from "@/lib/types";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";

function NewTaskContent() {
  const router = useRouter();
  const { createTask } = useTaskMutations();

  const handleSubmit = async (data: TaskCreate) => {
    await createTask(data);
    router.push("/dashboard");
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Header />
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Create New Task</h2>
          <p className="text-gray-600 mt-2">
            Fill in the details below to create a new task
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <TaskForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Create Task"
          />
        </div>
      </div>
    </div>
  );
}

export default function NewTaskPage() {
  return (
    <AuthGuard>
      <NewTaskContent />
    </AuthGuard>
  );
}
