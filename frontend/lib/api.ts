import { Task, TaskCreate, TaskUpdate, TaskFilters } from "./types";
import { getAuthToken } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8001/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public detail?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function requireAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (!token) {
    throw new ApiError(401, "No authentication token found.");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      detail: `HTTP Error: ${response.status}`,
    }));
    const errorMessage = typeof errorData.detail === 'string' 
      ? errorData.detail 
      : errorData.detail?.message || JSON.stringify(errorData.detail) || `HTTP Error: ${response.status}`;
    throw new ApiError(response.status, errorMessage, errorData.detail);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as T;
}

/**
 * A robust URL builder that prevents duplicate path segments.
 * It handles cases where the base URL might incorrectly contain parts of the path.
 */
function buildUrl(path = "", params?: URLSearchParams): string {
  // Normalize base URL: remove any trailing slashes or a rogue /tasks segment.
  const normalizedBaseUrl = API_BASE_URL.replace(/\/+$/, "").replace(/\/tasks\/?$/, "");

  // Normalize path: ensure it starts with a single slash.
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Combine and create the URL object.
  const fullUrl = new URL(`${normalizedBaseUrl}${normalizedPath}`);
  
  if (params) {
    fullUrl.search = params.toString();
  }
  
  return fullUrl.toString();
}

export async function fetchTasks(filters?: TaskFilters, sort?: any): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (sort?.sort_by) params.append("sort_by", sort.sort_by);
  if (sort?.sort_order) params.append("sort_order", sort.sort_order);

  const response = await fetch(buildUrl("/tasks", params), {
    headers: requireAuthHeaders(),
  });

  return handleResponse(response);
}

export async function fetchTask(id: number): Promise<Task> {
  const response = await fetch(buildUrl(`/tasks/${id}`), {
    headers: requireAuthHeaders(),
  });
  return handleResponse(response);
}

export async function createTask(data: TaskCreate): Promise<Task> {
  const response = await fetch(buildUrl("/tasks"), {
    method: "POST",
    headers: requireAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateTask(id: number, data: TaskUpdate): Promise<Task> {
  const response = await fetch(buildUrl(`/tasks/${id}`), {
    method: "PUT",
    headers: requireAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(buildUrl(`/tasks/${id}`), {
    method: "DELETE",
    headers: requireAuthHeaders(),
  });
  await handleResponse(response);
}
