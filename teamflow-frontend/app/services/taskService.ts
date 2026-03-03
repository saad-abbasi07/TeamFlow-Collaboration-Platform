import { apiFetch } from "./apiClient";

export type Task = {
  _id: string;
  title: string;
  description?: string;
  priority?: "Low" | "Medium" | "High";
  dueDate?: string;
  project: string;
  workspace: string;
  createdBy?: string;
  assignedTo?: string;
  status?: "Todo" | "In Progress" | "Done";
};

export const getTasksByProject = async (projectId: string) => {
  return apiFetch<Task[]>(`/tasks/project/${projectId}`);
};

export const createTask = async (task: {
  title: string;
  description?: string;
  projectId: string;
  priority?: string;
  dueDate?: string;
  assignedTo?: string;
  status?: string;
}) => {
  const response = await apiFetch<{ success: boolean; data: Task }>(`/tasks`, {
    method: "POST",
    body: JSON.stringify(task),
  });
  return response.data;
};

export const updateTask = async (taskId: string, task: {
  title?: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  assignedTo?: string;
  status?: string;
}) => {
  const response = await apiFetch<{ success: boolean; data: Task }>(`/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(task),
  });
  return response.data;
};

export const deleteTask = async (taskId: string) => {
  const response = await apiFetch<{ success: boolean; message: string }>(`/tasks/${taskId}`, {
    method: "DELETE",
  });
  return response;
};