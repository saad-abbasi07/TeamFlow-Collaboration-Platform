import { apiFetch } from "./apiClient";

export type Workspace = {
  _id: string;
  name: string;
};

export const fetchMyWorkspaces = async () => {
  return apiFetch<Workspace[]>("/workspaces");
};

export const createWorkspace = async (input: { name: string }) => {
  const response = await apiFetch<{ success: boolean; data: Workspace }>("/workspaces", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
};

export const updateWorkspace = async (workspaceId: string, workspace: {
  name: string;
}) => {
  const response = await apiFetch<{ success: boolean; data: Workspace }>(`/workspaces/${workspaceId}`, {
    method: "PUT",
    body: JSON.stringify(workspace),
  });
  return response.data;
};

export const deleteWorkspace = async (workspaceId: string) => {
  const response = await apiFetch<{ success: boolean; message: string }>(`/workspaces/${workspaceId}`, {
    method: "DELETE",
  });
  return response;
};
