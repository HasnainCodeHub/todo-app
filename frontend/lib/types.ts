export type Priority = "low" | "medium" | "high";
export type Recurrence = "none" | "daily" | "weekly" | "monthly";

export interface Task {
  id: number;
  user_id: string;  // Phase II: Multi-user support
  title: string;
  description: string | null;
  completed: boolean;
  priority?: Priority;  // Optional - API may not always include this
  tags?: string[];
  due_date: string | null; // ISO string
  recurrence?: Recurrence;  // Optional - API may not always include this
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string | null;
  priority?: Priority;
  tags?: string[];
  due_date?: string | null;
  recurrence?: Recurrence;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  completed?: boolean;
  priority?: Priority;
  tags?: string[];
  due_date?: string | null;
  recurrence?: Recurrence;
}

export interface TaskFilters {
  status?: "completed" | "pending";
  priority?: Priority;
  tag?: string;
  search?: string;
  due_from?: string;
  due_to?: string;
}

export interface TaskSort {
  sort_by?: "due_date" | "priority" | "title" | "created_at";
  sort_order?: "asc" | "desc";
}

export interface CompleteTaskResponse {
  task: Task;
  next_task: Task | null;
}
