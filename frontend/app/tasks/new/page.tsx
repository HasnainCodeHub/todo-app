"use client";

import { useRouter } from "next/navigation";
import TaskForm from "@/components/TaskForm";
import { useTaskMutations } from "@/hooks/useTaskMutations";
import { TaskCreate, TaskUpdate } from "@/lib/types";
import AuthGuard from "@/components/AuthGuard";
import PageWrapper from "@/components/global/PageWrapper";


function NewTaskContent() {
  const router = useRouter();
  const { createTask } = useTaskMutations();

  const handleSubmit = async (data: TaskCreate | TaskUpdate) => {
    await createTask(data as TaskCreate);
    router.push("/dashboard");
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-text-primary">Create New Task</h2>
          <p className="text-text-secondary mt-2">
            Fill in the details below to create a new task
          </p>
        </div>

        <div className="bg-bg-secondary rounded-lg shadow-lg border border-white/10 p-6">
          <TaskForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Create Task"
          />
        </div>
      </div>
    </PageWrapper>
  );
}

export default function NewTaskPage() {
  return (
    <AuthGuard>
      <NewTaskContent />
    </AuthGuard>
  );
}
