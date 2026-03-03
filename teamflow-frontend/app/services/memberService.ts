import { apiFetch } from "./apiClient";

export interface WorkspaceMember {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  role: "Owner" | "Admin" | "Member";
}

export const getWorkspaceMembers = async (workspaceId: string) => {
  return apiFetch<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`);
};

export const inviteMember = async (workspaceId: string, email: string, role: "Admin" | "Member" = "Member") => {
  const response = await apiFetch<{ success: boolean; data: WorkspaceMember }>(`/workspaces/${workspaceId}/members`, {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
  return response.data;
};

export const updateMemberRole = async (workspaceId: string, memberId: string, role: "Owner" | "Admin" | "Member") => {
  const response = await apiFetch<{ success: boolean; data: WorkspaceMember }>(`/workspaces/${workspaceId}/members/${memberId}`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
  return response.data;
};

export const removeMember = async (workspaceId: string, memberId: string) => {
  const response = await apiFetch<{ success: boolean; message: string }>(`/workspaces/${workspaceId}/members/${memberId}`, {
    method: "DELETE",
  });
  return response;
};
