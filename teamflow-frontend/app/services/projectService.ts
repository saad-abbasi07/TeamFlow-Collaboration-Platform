import { apiFetch } from "./apiClient";

export type Project = {
  _id: string;
  name: string;
  description?: string;
  status?: "Active" | "Completed";
  members?: Array<{
    _id: string;
    user: {
      _id: string;
      name: string;
      email: string;
    };
    role: "Owner" | "Admin" | "Member";
  }>;
};

export const fetchProjectsByWorkspace = async (workspaceId: string) => {
  return apiFetch<Project[]>(`/projects/${workspaceId}`);
};

export const createProject = async (input: { name: string; description?: string; workspaceId: string }) => {
  const response = await apiFetch<{ success: boolean; data: Project }>("/projects", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
};

export const updateProject = async (projectId: string, project: {
  name?: string;
  description?: string;
  status?: "Active" | "Completed";
}) => {
  const response = await apiFetch<{ success: boolean; data: Project }>(`/projects/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(project),
  });
  return response.data;
};

export const deleteProject = async (projectId: string) => {
  const response = await apiFetch<{ success: boolean; message: string }>(`/projects/${projectId}`, {
    method: "DELETE",
  });
  return response;
};
