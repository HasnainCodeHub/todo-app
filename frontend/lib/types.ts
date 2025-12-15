export interface Task {
  id: number;
  user_id: string;  // Phase II: Multi-user support
  title: string;
  description: string | null;
  completed: boolean;
  priority: "low" | "medium" | "high";
  tags?: string[];
  due_date: string | null; // ISO string
  recurrence: "none" | "daily" | "weekly" | "monthly";
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string | null;
  priority?: "low" | "medium" | "high";
  tags?: string[];
  due_date?: string | null;
  recurrence?: "none" | "daily" | "weekly" | "monthly";
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  completed?: boolean;
  priority?: "low" | "medium" | "high";
  tags?: string[];
  due_date?: string | null;
  recurrence?: "none" | "daily" | "weekly" | "monthly";
}

export interface TaskFilters {
  status?: "completed" | "pending";
  priority?: "low" | "medium" | "high";
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
